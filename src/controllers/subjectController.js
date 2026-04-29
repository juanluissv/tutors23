import asyncHandler from 'express-async-handler';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Subject from '../models/subjectModel.js';
import School from '../models/schoolModel.js';
import SchoolAdmin from '../models/schoolAdminModel.js';
import { getS3, getBookBucketName, getBookKeyPrefix, getPublicBookUrlFromKey } from '../config/s3Client.js';

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
        grade: subject.grade,
        teacherEmail: normalizeTeacherEmailsForJson(subject.teacherEmail),
        isCoursePublish: subject.isCoursePublish,
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

    const subjects = await Subject.find({ school: schoolId })
        .sort({ dateCreated: -1, createdAt: -1 })
        .lean();

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

    const subjects = await Subject.find({ teachers: teacherId })
        .sort({ dateCreated: -1, createdAt: -1 })
        .lean();

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

// GET /api/subjects/:id/teacher/students — assigned teacher only; enrolled
// students ObjectIds only (populate)
const getSubjectStudentsForTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid subject id');
    }

    const subject = await Subject.findById(id)
        .populate({
            path: 'students',
            select: 'firstname lastname email signInDate createdAt subscriptions',
        })
        .lean();

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

    const rawStudents = subject.students || [];
    const studentsOut = rawStudents
        .filter((s) => s != null)
        .map((student) => {
            const subs = student.subscriptions || [];
            const forSub = subs.find(
                (sub) =>
                    sub.subject != null && String(sub.subject) === String(id),
            );
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
                questionsAsked:
                    typeof forSub?.questionsAsked === 'number'
                        ? forSub.questionsAsked
                        : 0,
                isActive: forSub ? forSub.active === true : false,
                joinedDate: joined
                    ? new Date(joined).toISOString().slice(0, 10)
                    : '',
            };
        });

    res.status(200).json({
        subject: {
            _id: subject._id,
            title: subject.title,
        },
        students: studentsOut,
    });
});

// POST /api/subjects — use with protectSchoolAdmin
const createSubject = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        grade,
        isCoursePublish,
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

    const subject = await Subject.create({
        title: String(title).trim(),
        description:
            description !== undefined && description !== null
                ? String(description).trim()
                : undefined,
        grade:
            grade !== undefined && grade !== null
                ? Number(grade)
                : undefined,
        isCoursePublish:
            isCoursePublish !== undefined
                ? Boolean(isCoursePublish)
                : undefined,
        dateCreated: new Date(),
        school: school._id,
    });

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
    if (req.body.grade !== undefined) {
        if (req.body.grade === null) {
            subject.set('grade', undefined);
        } else {
            const n = Number(req.body.grade);
            if (Number.isNaN(n)) {
                res.status(400);
                throw new Error('Invalid grade');
            }
            subject.grade = n;
        }
    }
    if (req.body.isCoursePublish !== undefined) {
        subject.isCoursePublish = Boolean(req.body.isCoursePublish);
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

    const updated = await subject.save();
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
    if (req.body.grade !== undefined) {
        const g = req.body.grade;
        if (g === null
            || (typeof g === 'string' && g.trim() === '')) {
            subject.set('grade', undefined);
        } else {
            const n = Number(g);
            if (Number.isNaN(n)) {
                res.status(400);
                throw new Error('Invalid grade');
            }
            subject.grade = n;
        }
    }
    if (req.body.isCoursePublish !== undefined) {
        const pub = parseBodyBoolean(req.body.isCoursePublish);
        if (pub !== undefined) {
            subject.isCoursePublish = pub;
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

    const updated = await Subject.findById(id);
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

    const updated = await Subject.findById(id);
    res.status(200).json(subjectToJson(updated));
});

export {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    getSubjectStudentsForTeacher,
    updateSubjectById,
    updateSubjectByTeacher,
    addSubjectStudentEmailForTeacher,
    setSubjectTeacherEmail,
};
