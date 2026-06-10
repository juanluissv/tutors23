import asyncHandler from 'express-async-handler';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Subject from '../models/subjectModel.js';
import School from '../models/schoolModel.js';
import SchoolAdmin from '../models/schoolAdminModel.js';
import Teacher from '../models/teacherModel.js';
import Question from '../models/questionModel.js';
import { getS3, getBookBucketName, getBookKeyPrefix, getPublicBookUrlFromKey } from '../config/s3Client.js';
import {
    gradeLevelsToJson,
    normalizeSubjectGradesLevelField,
    resolveSubjectGradeLevels,
} from '../utils/gradeLevelHelpers.js';

/** Always return [] or string[] for API (handles legacy single-string docs). */
function normalizeTeacherEmailsForJson (val) {
    if (val == null || val === '') {
        return [];
    }
    if (Array.isArray(val)) {
        return val.map((e) => String(e));
    }
    return [String(val)];
}

const subjectToJson = (subject) => {
    const bookId = subject.bookId;
    const bookUrl = bookId
        ? getPublicBookUrlFromKey(bookId) || undefined
        : undefined;
    return {
        _id: subject._id,
        title: subject.title,
        description: subject.description,
        gradesLevel: gradeLevelsToJson(
            normalizeSubjectGradesLevelField(subject.gradesLevel),
        ),
        teacherEmail: normalizeTeacherEmailsForJson(subject.teacherEmail),
        bookId,
        bookUrl,
        dateCreated: subject.dateCreated,
        school: subject.school,
        studentCount: Array.isArray(subject.students)
            ? subject.students.length
            : 0,
        teacherCount: Array.isArray(subject.teachers)
            ? subject.teachers.length
            : 0,
        studentsEmail: Array.isArray(subject.studentsEmail)
            ? subject.studentsEmail
            : [],
    };
};

const subjectGradeLevelPopulate = {
    path: 'gradesLevel',
    select: 'name',
};

async function findSubjectWithGradeLevel (query) {
    return Subject.findOne(query).populate(subjectGradeLevelPopulate);
}

async function findSubjectsWithGradeLevel (query) {
    return Subject.find(query)
        .populate(subjectGradeLevelPopulate)
        .sort({ dateCreated: -1, createdAt: -1 });
}

function buildEmailExactRegex (rawEmail) {
    const trimmed = String(rawEmail).trim();
    if (!trimmed) {
        return null;
    }
    return new RegExp(
        `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i',
    );
}

async function syncSubjectTeacherLinks (subjectDoc, schoolId) {
    const emails = normalizeTeacherEmailsForJson(subjectDoc.teacherEmail)
        .map((email) => String(email).trim().toLowerCase())
        .filter((email) => email !== '');

    const previousTeacherIds = (subjectDoc.teachers || []).map((id) => String(id));
    const nextTeacherIds = [];

    for (const email of emails) {
        const emailRegex = buildEmailExactRegex(email);
        if (!emailRegex) {
            continue;
        }
        const teacherDoc = await Teacher.findOne({
            email: emailRegex,
            school: schoolId,
        });
        if (teacherDoc) {
            nextTeacherIds.push(String(teacherDoc._id));
        }
    }

    const uniqueNext = [...new Set(nextTeacherIds)];
    subjectDoc.teachers = uniqueNext.map((id) => new mongoose.Types.ObjectId(id));

    const removed = previousTeacherIds.filter(
        (id) => !uniqueNext.includes(id),
    );
    const added = uniqueNext.filter(
        (id) => !previousTeacherIds.includes(id),
    );

    if (removed.length) {
        await Teacher.updateMany(
            { _id: { $in: removed } },
            { $pull: { subjects: subjectDoc._id } },
        );
    }

    for (const teacherId of added) {
        await Teacher.updateOne(
            { _id: teacherId },
            { $addToSet: { subjects: subjectDoc._id } },
        );
    }
}

function parseBodyBoolean (v) {
    if (v === true || v === 'true' || v === '1' || v === 1) {
        return true;
    }
    if (v === false || v === 'false' || v === '0' || v === 0 || v === '' || v === null) {
        return false;
    }
    if (v === undefined) {
        return undefined;
    }
    return Boolean(v);
}

// GET /api/subjects/school/:schoolId — use with protectSchoolAdmin
const getSubjectsBySchool = asyncHandler(async (req, res) => {
    const { schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    if (
        schoolAdmin.school &&
        String(schoolAdmin.school) !== String(schoolId)
    ) {
        res.status(403);
        throw new Error('Not authorized to view subjects for this school');
    }

    const school = await School.findById(schoolId);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view subjects for this school');
    }

    const subjects = await findSubjectsWithGradeLevel({ school: schoolId });

    res.status(200).json(subjects.map(subjectToJson));
});

// GET /api/subjects/teacher/:teacherId — use with protectTeacher; own id only
const getSubjectsByTeacherId = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        res.status(400);
        throw new Error('Invalid teacher id');
    }

    if (req.teacher._id.toString() !== String(teacherId)) {
        res.status(403);
        throw new Error('Not authorized to view subjects for this teacher');
    }

    const subjects = await findSubjectsWithGradeLevel({ teachers: teacherId });

    res.status(200).json(subjects.map(subjectToJson));
});

// GET /api/subjects/:id/teacher/book — use with protectTeacher; 302 to S3 PDF
const getSubjectBookForTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const teacherId = req.teacher._id;
    const isAssigned = (subject.teachers || []).some(
        (t) => String(t) === String(teacherId),
    );

    if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to open this book');
    }

    if (!subject.bookId || String(subject.bookId).trim() === '') {
        res.status(404);
        throw new Error('No book uploaded for this subject');
    }

    const direct = getPublicBookUrlFromKey(subject.bookId);
    if (direct) {
        return res.redirect(302, direct);
    }

    const s3 = getS3();
    const bucket = getBookBucketName();
    if (!s3 || !bucket) {
        res.status(503);
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        );
    }

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: subject.bookId,
        Expires: 60 * 30,
        ResponseContentType: 'application/pdf',
    });
    return res.redirect(302, url);
});

// GET /api/subjects/:id/school-admin/book — use with protectSchoolAdmin; 302 to S3 PDF
const getSubjectBookForSchoolAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const school = await School.findById(subject.school);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to open this book');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== String(subject.school)
    ) {
        res.status(403);
        throw new Error('Not authorized to open this book');
    }

    if (!subject.bookId || String(subject.bookId).trim() === '') {
        res.status(404);
        throw new Error('No book uploaded for this subject');
    }

    const direct = getPublicBookUrlFromKey(subject.bookId);
    if (direct) {
        return res.redirect(302, direct);
    }

    const s3 = getS3();
    const bucket = getBookBucketName();
    if (!s3 || !bucket) {
        res.status(503);
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        );
    }

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: subject.bookId,
        Expires: 60 * 30,
        ResponseContentType: 'application/pdf',
    });
    return res.redirect(302, url);
});

function startOfCurrentMonth (now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function isSubscriptionActiveForSubject (sub, now = new Date()) {
    if (!sub) {
        return false;
    }
    if (sub.pastDue === true) {
        return false;
    }
    const endDate = sub.endDate ? new Date(sub.endDate) : null;
    if (endDate && !Number.isNaN(endDate.getTime()) && now.getTime() > endDate.getTime()) {
        return false;
    }
    return sub.active === true;
}

function findSubscriptionForSubject (student, subjectId) {
    const subs = student.subscriptions || [];
    const matching = subs.filter((sub) => {
        const plan = sub.plan;
        if (!plan || typeof plan !== 'object') {
            return false;
        }
        const planSubjects = plan.subjects || [];
        return planSubjects.some(
            (s) => String(s?._id ?? s) === String(subjectId),
        );
    });

    if (matching.length === 0) {
        return null;
    }

    matching.sort(
        (a, b) =>
            new Date(b.createdAt || 0).getTime()
            - new Date(a.createdAt || 0).getTime(),
    );
    return matching[0];
}

async function buildEnrolledStudentsForSubject (subject, subjectId) {
    const students = (subject.students || []).filter((s) => s != null);
    const studentIds = students.map((s) => s._id);
    const countByStudent = new Map();

    if (studentIds.length > 0) {
        const monthStart = startOfCurrentMonth();
        const tallies = await Question.aggregate([
            {
                $match: {
                    subject: new mongoose.Types.ObjectId(String(subjectId)),
                    student: { $in: studentIds },
                    createdAt: { $gte: monthStart },
                },
            },
            { $group: { _id: '$student', count: { $sum: 1 } } },
        ]);

        for (const row of tallies) {
            countByStudent.set(String(row._id), row.count);
        }
    }

    const now = new Date();

    return students.map((student) => {
        const forSub = findSubscriptionForSubject(student, subjectId);
        const joined = student.signInDate || student.createdAt || null;
        const name = [student.firstname, student.lastname]
            .filter(Boolean)
            .join(' ')
            .trim();

        return {
            _id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            name: name || student.email || 'Student',
            email: student.email,
            questionsAsked: countByStudent.get(String(student._id)) ?? 0,
            isActive: isSubscriptionActiveForSubject(forSub, now),
            joinedDate: joined
                ? new Date(joined).toISOString().slice(0, 10)
                : '',
        };
    });
}

async function findSubjectWithEnrolledStudents (subjectId) {
    return Subject.findById(subjectId)
        .populate({
            path: 'students',
            select: 'firstname lastname email signInDate createdAt subscriptions',
            populate: {
                path: 'subscriptions',
                select: 'active pastDue endDate createdAt',
                populate: {
                    path: 'plan',
                    select: 'subjects',
                },
            },
        })
        .lean();
}

// GET /api/subjects/:id/teacher/students — assigned teacher only; enrolled
// students ObjectIds only (populate)
const getSubjectStudentsForTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const subject = await findSubjectWithEnrolledStudents(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const teacherId = req.teacher._id;
    const isAssigned = (subject.teachers || []).some(
        (t) => String(t) === String(teacherId),
    );

    if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view students for this subject');
    }

    res.status(200).json({
        subject: {
            _id: subject._id,
            title: subject.title,
        },
        students: await buildEnrolledStudentsForSubject(subject, id),
    });
});

// GET /api/subjects/:id/school-admin/students — school admin only
const getSubjectStudentsForSchoolAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const subject = await findSubjectWithEnrolledStudents(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const subjectSchoolId = subject.school ? String(subject.school) : null;

    if (!subjectSchoolId) {
        res.status(400);
        throw new Error('Subject is not linked to a school');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== subjectSchoolId
    ) {
        res.status(403);
        throw new Error('Not authorized to view students for this subject');
    }

    const school = await School.findById(subjectSchoolId);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (
        !school.admin
        || school.admin.toString() !== req.schoolAdmin._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to view students for this subject');
    }

    res.status(200).json({
        subject: {
            _id: subject._id,
            title: subject.title,
        },
        students: await buildEnrolledStudentsForSubject(subject, id),
    });
});

// POST /api/subjects — use with protectSchoolAdmin
const createSubject = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        gradesLevel,
        school: schoolIdFromBody,
    } = req.body;

    if (!title || String(title).trim() === '') {
        res.status(400);
        throw new Error('Subject title is required');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const rawSchoolId = schoolIdFromBody ?? schoolAdmin.school;
    if (!rawSchoolId) {
        res.status(400);
        throw new Error('School is required; link or register a school first');
    }

    const schoolIdStr =
        typeof rawSchoolId === 'object' && rawSchoolId._id
            ? String(rawSchoolId._id)
            : String(rawSchoolId);

    if (!mongoose.Types.ObjectId.isValid(schoolIdStr)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    if (
        schoolAdmin.school &&
        String(schoolAdmin.school) !== schoolIdStr
    ) {
        res.status(403);
        throw new Error('Not authorized to create a subject for this school');
    }

    const school = await School.findById(schoolIdStr);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to create a subject for this school');
    }

    const parsedGradesLevel = await resolveSubjectGradeLevels(
        gradesLevel,
        school,
    );
    if (parsedGradesLevel.error) {
        res.status(400);
        throw new Error(parsedGradesLevel.error);
    }

    const createdSubject = await Subject.create({
        title: String(title).trim(),
        description:
            description !== undefined && description !== null
                ? String(description).trim()
                : undefined,
        gradesLevel: parsedGradesLevel.value ?? [],
        dateCreated: new Date(),
        school: school._id,
    });

    if (req.file) {
        const s3 = getS3();
        const bucket = getBookBucketName();
        if (!s3 || !bucket) {
            res.status(503);
            throw new Error(
                'File storage is not configured. Set AWS credentials and '
                + 'AWS_S3_BUCKET.',
            );
        }

        const prefix = getBookKeyPrefix();
        const random = crypto.randomBytes(8).toString('hex');
        const key = `${prefix}/${String(createdSubject._id)}/school-admin-${String(
            req.schoolAdmin._id,
        )}-${random}.pdf`;
        try {
            const upload = await s3.upload({
                Bucket: bucket,
                Key: key,
                Body: req.file.buffer,
                ContentType: 'application/pdf',
            }).promise();
            createdSubject.bookId = upload.Key;
            await createdSubject.save();
        } catch (err) {
            console.error(err);
            res.status(502);
            throw new Error('Failed to upload the PDF to storage.');
        }
    }

    const subject = await findSubjectWithGradeLevel({ _id: createdSubject._id });

    res.status(201).json(subjectToJson(subject));
});

// PUT /api/subjects/:id — use with protectSchoolAdmin
const updateSubjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const school = await School.findById(subject.school);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    if (
        schoolAdmin.school &&
        String(schoolAdmin.school) !== String(subject.school)
    ) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    if (req.body.title !== undefined) {
        if (!req.body.title || String(req.body.title).trim() === '') {
            res.status(400);
            throw new Error('Subject title cannot be empty');
        }
        subject.title = String(req.body.title).trim();
    }
    if (req.body.description !== undefined) {
        if (req.body.description === null) {
            subject.set('description', undefined);
        } else {
            subject.description = String(req.body.description).trim();
        }
    }
       

    if (req.body.teacherEmail !== undefined) {
        if (req.body.teacherEmail === null || req.body.teacherEmail === '') {
            subject.set('teacherEmail', undefined);
        } else if (Array.isArray(req.body.teacherEmail)) {
            const cleaned = [];
            for (const raw of req.body.teacherEmail) {
                if (raw == null || String(raw).trim() === '') {
                    continue;
                }
                const t = String(raw).trim().toLowerCase();
                if (!/^\S+@\S+\.\S+$/.test(t)) {
                    res.status(400);
                    throw new Error('Invalid teacher email');
                }
                cleaned.push(t);
            }
            subject.teacherEmail = [...new Set(cleaned)];
        } else {
            const trimmed = String(req.body.teacherEmail).trim().toLowerCase();
            if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
                res.status(400);
                throw new Error('Invalid teacher email');
            }
            subject.teacherEmail = [trimmed];
        }
    }

    if (req.body.teacherEmail !== undefined) {
        await syncSubjectTeacherLinks(subject, school._id);
    }

    if (req.file) {
        const s3 = getS3();
        const bucket = getBookBucketName();
        if (!s3 || !bucket) {
            res.status(503);
            throw new Error(
                'File storage is not configured. Set AWS credentials and '
                + 'AWS_S3_BUCKET.',
            );
        }

        const previousBookKey = subject.bookId
            && String(subject.bookId).trim() !== ''
            ? String(subject.bookId).trim()
            : null;

        const prefix = getBookKeyPrefix();
        const random = crypto.randomBytes(8).toString('hex');
        const key = `${prefix}/${id}/school-admin-${String(
            req.schoolAdmin._id,
        )}-${random}.pdf`;
        try {
            const upload = await s3.upload({
                Bucket: bucket,
                Key: key,
                Body: req.file.buffer,
                ContentType: 'application/pdf',
            }).promise();
            subject.bookId = upload.Key;

            if (
                previousBookKey
                && previousBookKey !== upload.Key
            ) {
                try {
                    await s3.deleteObject({
                        Bucket: bucket,
                        Key: previousBookKey,
                    }).promise();
                } catch (delErr) {
                    console.error(
                        'Could not delete previous book from S3:',
                        delErr,
                    );
                }
            }
        } catch (err) {
            console.error(err);
            res.status(502);
            throw new Error('Failed to upload the PDF to storage.');
        }
    }

    const updated = await subject.save();
    await updated.populate(subjectGradeLevelPopulate);
    res.status(200).json(subjectToJson(updated));
});

// PUT /api/subjects/:id/teacher — use with protectTeacher; assigned teacher only
const updateSubjectByTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const teacherId = req.teacher._id;
    const isAssigned = (subject.teachers || []).some(
        (t) => String(t) === String(teacherId),
    );

    if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    if (req.body.title !== undefined) {
        if (!req.body.title || String(req.body.title).trim() === '') {
            res.status(400);
            throw new Error('Subject title cannot be empty');
        }
        subject.title = String(req.body.title).trim();
    }
    if (req.body.description !== undefined) {
        if (req.body.description === null) {
            subject.set('description', undefined);
        } else {
            subject.description = String(req.body.description).trim();
        }
    }

    if (req.file) {
        const s3 = getS3();
        const bucket = getBookBucketName();
        if (!s3 || !bucket) {
            res.status(503);
            throw new Error(
                'File storage is not configured. Set AWS credentials and '
                + 'AWS_S3_BUCKET.',
            );
        }

        const previousBookKey = subject.bookId
            && String(subject.bookId).trim() !== ''
            ? String(subject.bookId).trim()
            : null;

        const prefix = getBookKeyPrefix();
        const random = crypto.randomBytes(8).toString('hex');
        const key = `${prefix}/${id}/${String(teacherId)}-${random}.pdf`;
        try {
            const upload = await s3.upload({
                Bucket: bucket,
                Key: key,
                Body: req.file.buffer,
                ContentType: 'application/pdf',
            }).promise();
            subject.bookId = upload.Key;

            if (
                previousBookKey
                && previousBookKey !== upload.Key
            ) {
                try {
                    await s3.deleteObject({
                        Bucket: bucket,
                        Key: previousBookKey,
                    }).promise();
                } catch (delErr) {
                    console.error(
                        'Could not delete previous book from S3:',
                        delErr,
                    );
                }
            }
        } catch (err) {
            console.error(err);
            res.status(502);
            throw new Error('Failed to upload the PDF to storage.');
        }
    }

    const updated = await subject.save();
    await updated.populate(subjectGradeLevelPopulate);
    res.status(200).json(subjectToJson(updated));
});

// PUT /api/subjects/:id/teacher/student-email — assigned teacher only;
// body: { email } — adds to subject studentsEmail list (deduped)
const addSubjectStudentEmailForTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    if (email === undefined || String(email).trim() === '') {
        res.status(400);
        throw new Error('Student email is required');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const teacherId = req.teacher._id;
    const isAssigned = (subject.teachers || []).some(
        (t) => String(t) === String(teacherId),
    );

    if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    const trimmed = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
        res.status(400);
        throw new Error('Invalid student email address');
    }

    await Subject.updateOne(
        { _id: id },
        { $addToSet: { studentsEmail: trimmed } },
    );

    const updated = await findSubjectWithGradeLevel({ _id: id });
    res.status(200).json(subjectToJson(updated));
});

// PUT /api/subjects/:id/teacher-email — use with protectSchoolAdmin; body: { email }
const setSubjectTeacherEmail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    if (email === undefined || String(email).trim() === '') {
        res.status(400);
        throw new Error('Teacher email is required');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    const school = await School.findById(subject.school);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== String(subject.school)
    ) {
        res.status(403);
        throw new Error('Not authorized to update this subject');
    }

    const trimmed = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
        res.status(400);
        throw new Error('Invalid email address');
    }

    await Subject.updateOne(
        { _id: id },
        { $addToSet: { teacherEmail: trimmed } },
    );

    const emailRegex = buildEmailExactRegex(trimmed);
    const teacherDoc = emailRegex
        ? await Teacher.findOne({ email: emailRegex })
        : null;

    if (
        teacherDoc
        && teacherDoc.school
        && String(teacherDoc.school) === String(subject.school)
    ) {
        await Subject.updateOne(
            { _id: id },
            { $addToSet: { teachers: teacherDoc._id } },
        );
        await Teacher.updateOne(
            { _id: teacherDoc._id },
            { $addToSet: { subjects: id } },
        );
    }

    const updated = await findSubjectWithGradeLevel({ _id: id });
    res.status(200).json(subjectToJson(updated));
});

export {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    getSubjectBookForSchoolAdmin,
    getSubjectStudentsForTeacher,
    getSubjectStudentsForSchoolAdmin,
    updateSubjectById,
    updateSubjectByTeacher,
    addSubjectStudentEmailForTeacher,
    setSubjectTeacherEmail,
    subjectToJson,
};
