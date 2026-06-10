import asyncHandler from 'express-async-handler';
import Student from '../models/studentModel.js';
import School from '../models/schoolModel.js';
import Subject from '../models/subjectModel.js';
import Plan from '../models/planModel.js';
import Course from '../models/courseModel.js';
import generateToken from '../utils/generateToken.js';
import { subjectToJson } from './subjectController.js';
import { planToJson } from './planController.js';
import {
    subscriptionToJson,
    studentSubscriptionsPopulate,
    refreshStudentSubscriptions,
} from './subscriptionController.js';

const subjectWithGradeLevelPopulate = {
    path: 'subjects',
    select: 'title description gradesLevel',
    populate: {
        path: 'gradesLevel',
        select: 'name',
    },
};

const studentPlanPopulate = {
    path: 'plans',
    select: 'price totalQuestions active gradesLevel subjects school createdAt',
    populate: [
        {
            path: 'subjects',
            select: 'title gradesLevel',
            populate: {
                path: 'gradesLevel',
                select: 'name',
            },
        },
        {
            path: 'gradesLevel',
            select: 'name',
        },
    ],
};



function normalizeStudentEmail (raw) {
    return String(raw || '').trim().toLowerCase();
}

function normalizeStudentUsername (raw) {
    return String(raw || '').trim().toLowerCase();
}

function buildEmailExactRegex (rawEmail) {
    const t = String(rawEmail).trim();
    if (!t) {
        return null;
    }
    return new RegExp(
        `^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i',
    );
}

function looksLikeEmail (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * If this email appears on any subject's studentsEmail invite list, ensure
 * subject.students includes this student and student.subjects includes those
 * subjects. Uses $addToSet (idempotent — already-linked pairs are unchanged).
 */
async function ensureStudentSubjectsLinkedFromInviteEmail (
    studentDoc,
    normalizedEmail,
) {
    const emailRegex = buildEmailExactRegex(normalizedEmail);
    if (!emailRegex) {
        return;
    }

    const subjects = await Subject.find({ studentsEmail: emailRegex })
        .select('_id')
        .lean();

    if (!subjects.length) {
        return;
    }

    const subjectIds = subjects.map((s) => s._id);

    await Subject.updateMany(
        { _id: { $in: subjectIds } },
        { $addToSet: { students: studentDoc._id } },
    );

    await Student.updateOne(
        { _id: studentDoc._id },
        { $addToSet: { subjects: { $each: subjectIds } } },
    );
}

/**
 * If the student was added by a school admin with plan(s), ensure plan
 * subjects are linked on both sides (idempotent).
 */
async function ensureStudentSubjectsLinkedFromAssignedPlans (
    studentDoc,
    normalizedEmail,
) {
    const planIds = (studentDoc.plans ?? []).filter(Boolean);
    if (planIds.length === 0) {
        return;
    }

    const plans = await Plan.find({ _id: { $in: planIds } })
        .select('subjects')
        .lean();

    const subjectIds = [
        ...new Set(
            plans.flatMap((p) =>
                (p.subjects ?? []).map((id) => String(id)),
            ),
        ),
    ].filter((id) => id !== 'undefined' && id !== 'null');

    if (subjectIds.length === 0) {
        return;
    }

    const subjectUpdate = {
        $addToSet: { students: studentDoc._id },
    };
    if (normalizedEmail) {
        subjectUpdate.$addToSet.studentsEmail = normalizedEmail;
    }
    await Subject.updateMany(
        { _id: { $in: subjectIds } },
        subjectUpdate,
    );

    await Student.updateOne(
        { _id: studentDoc._id },
        { $addToSet: { subjects: { $each: subjectIds } } },
    );
}

function studentSubscriptionsToJson (doc) {
    const raw = doc.subscriptions ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    return raw.map((sub) => {
        if (sub != null && typeof sub === 'object' && sub._id) {
            return subscriptionToJson(sub);
        }
        return { _id: sub };
    });
}

function studentPlansToJson (doc) {
    const raw = doc.plans ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    return raw.map((plan) => {
        if (plan != null && typeof plan === 'object' && plan._id) {
            return planToJson(plan);
        }
        return { _id: plan };
    });
}

// POST /api/students/login
const authStudent = asyncHandler(async (req, res) => {
    const { username: rawUsername, password } = req.body;
    const username = normalizeStudentUsername(rawUsername);
    if (!username) {
        res.status(400);
        throw new Error('Username is required');
    }

    const student = await Student.findOne({ username });

    if (student && (await student.matchPassword(password))) {
        const emailNorm = student.email
            ? normalizeStudentEmail(student.email)
            : '';
        if (emailNorm) {
            await ensureStudentSubjectsLinkedFromInviteEmail(
                student,
                emailNorm,
            );
        }
        await ensureStudentSubjectsLinkedFromAssignedPlans(
            student,
            emailNorm,
        );
        await refreshStudentSubscriptions(student._id);

        const fresh = await Student.findById(student._id)
            .select('-password')
            .populate(studentPlanPopulate)
            .populate(studentSubscriptionsPopulate);

        generateToken(res, fresh._id);
        res.json({
            _id: fresh._id,
            firstname: fresh.firstname,
            lastname: fresh.lastname,
            username: fresh.username,
            email: fresh.email ?? null,
            country: fresh.country,
            city: fresh.city,
            subscriptions: studentSubscriptionsToJson(fresh),
            subjects: fresh.subjects ?? [],
            plans: studentPlansToJson(fresh),
        });
    } else {
        res.status(401);
        throw new Error('Invalid username or password');
    }
});

function isStudentRegistrationComplete (studentDoc) {
    const pwd = studentDoc?.password;
    return typeof pwd === 'string' && pwd.trim() !== '';
}

async function assertStudentIsOnSchoolRoster (res, studentId) {
    const listedOnSchool = await School.exists({ students: studentId });
    if (!listedOnSchool) {
        res.status(403);
        throw new Error(
            'You must be added to a school before you can register. '
            + 'Contact your school admin for your username.',
        );
    }
}

// POST /api/students/register
const registerStudent = asyncHandler(async (req, res) => {
    const {
        username: rawUsername,
        password,
        firstname: rawFirstname,
        lastname: rawLastname,
    } = req.body;

    const username = normalizeStudentUsername(rawUsername);
    if (!username) {
        res.status(400);
        throw new Error('Username is required');
    }

    const pwd = String(password ?? '');
    if (pwd.trim() === '') {
        res.status(400);
        throw new Error('Password is required');
    }

    const firstTrim =
        rawFirstname != null ? String(rawFirstname).trim() : '';
    const lastTrim =
        rawLastname != null ? String(rawLastname).trim() : '';
    if (firstTrim === '') {
        res.status(400);
        throw new Error('First name is required');
    }
    if (lastTrim === '') {
        res.status(400);
        throw new Error('Last name is required');
    }

    const firstname = firstTrim.toLowerCase();
    const lastname = lastTrim.toLowerCase();

    const existing = await Student.findOne({ username });

    if (!existing) {
        res.status(403);
        throw new Error(
            'No account found for this username. Your school admin must '
            + 'add you to the school before you can register.',
        );
    }

    await assertStudentIsOnSchoolRoster(res, existing._id);

    if (isStudentRegistrationComplete(existing)) {
        res.status(400);
        throw new Error(
            'An account with this username already exists. Please sign in.',
        );
    }

    existing.firstname = firstname;
    existing.lastname = lastname;
    existing.password = pwd;
    existing.signInDate = new Date();
    const student = await existing.save();
    const completedPendingAccount = true;

    const emailNorm = student.email
        ? normalizeStudentEmail(student.email)
        : '';
    if (emailNorm) {
        await ensureStudentSubjectsLinkedFromInviteEmail(student, emailNorm);
    }
    await ensureStudentSubjectsLinkedFromAssignedPlans(student, emailNorm);

    const saved = await Student.findById(student._id)
        .select('-password')
        .populate(studentPlanPopulate);

    generateToken(res, saved._id);
    res.status(completedPendingAccount ? 200 : 201).json({
        _id: saved._id,
        firstname: saved.firstname,
        lastname: saved.lastname,
        username: saved.username,
        email: saved.email ?? null,
        school: saved.school ?? null,
        subjects: saved.subjects ?? [],
        plans: studentPlansToJson(saved),
        accountCompleted: completedPendingAccount,
    });
});


// POST /api/student/logout
const logoutStudent = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
});


function studentProfileResponse (doc) {
    const birth =
        doc.birthDate instanceof Date && !Number.isNaN(doc.birthDate.getTime())
            ? doc.birthDate.toISOString().slice(0, 10)
            : null

    return {
        _id: doc._id,
        firstname: doc.firstname,
        lastname: doc.lastname,
        username: doc.username ?? null,
        email: doc.email ?? null,
        subscriptions: studentSubscriptionsToJson(doc),
        plans: studentPlansToJson(doc),
        city: doc.city ?? '',
        country: doc.country ?? '',
        birthDate: birth,
        subjects: doc.subjects ?? [],
    }
}

// GET /api/students/profile
const GetStudentProfile = asyncHandler(async (req, res) => {
    await refreshStudentSubscriptions(req.student._id);

    const student = await Student.findById(req.student._id)
        .select('-password')
        .populate(subjectWithGradeLevelPopulate)
        .populate(studentPlanPopulate)
        .populate(studentSubscriptionsPopulate)

    if (!student) {
        res.status(404)
        throw new Error('Student not found')
    }

    res.json(studentProfileResponse(student))
})


// PUT /api/students/profile
const updateStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id)

    if (!student) {
        res.status(404)
        throw new Error('Student not found')
    }

    if (req.body.firstname !== undefined) {
        const t = String(req.body.firstname).trim().toLowerCase()
        if (t === '') {
            res.status(400)
            throw new Error('First name is required')
        }
        student.firstname = t
    }
    if (req.body.lastname !== undefined) {
        const t = String(req.body.lastname).trim().toLowerCase()
        if (t === '') {
            res.status(400)
            throw new Error('Last name is required')
        }
        student.lastname = t
    }

    if (req.body.email !== undefined) {
        const nextEmail = normalizeStudentEmail(req.body.email)
        if (!nextEmail) {
            res.status(400)
            throw new Error('Email is required')
        }
        if (!looksLikeEmail(nextEmail)) {
            res.status(400)
            throw new Error('Please enter a valid email address')
        }
        const dupRegex = buildEmailExactRegex(nextEmail)
        if (dupRegex) {
            const taken = await Student.findOne({
                email: dupRegex,
                _id: { $ne: student._id },
            })
            if (taken) {
                res.status(400)
                throw new Error('A student with this email already exists')
            }
        }
        student.email = nextEmail
    }

    if (req.body.city !== undefined) {
        const t = String(req.body.city).trim()
        student.city = t === '' ? null : t
    }
    if (req.body.country !== undefined) {
        const t = String(req.body.country).trim()
        student.country = t === '' ? null : t
    }

    if (req.body.birthDate !== undefined) {
        const raw = req.body.birthDate
        if (raw === null || raw === '') {
            student.set('birthDate', null)
        } else {
            const d = new Date(raw)
            if (Number.isNaN(d.getTime())) {
                res.status(400)
                throw new Error('Invalid birth date')
            }
            student.birthDate = d
        }
    }

    if (req.body.subscriptions !== undefined) {
        student.subscriptions = req.body.subscriptions
    }

    if (req.body.plans !== undefined) {
        student.plans = req.body.plans
    }

    const pwd = req.body.password != null ? String(req.body.password) : ''
    if (pwd.trim() !== '') {
        if (pwd.length < 6) {
            res.status(400)
            throw new Error('Password must be at least 6 characters')
        }
        student.password = pwd
    }

    await student.save()

    const updated = await Student.findById(student._id)
        .select('-password')
        .populate(subjectWithGradeLevelPopulate)
        .populate(studentPlanPopulate)

    res.json(studentProfileResponse(updated))
})

// GET /api/students/mysubjects
const getMySubjects = asyncHandler(async (req, res) => {
    const studentId = req.student._id
    const subjects = await Subject.find({ students: studentId })
        .sort({ dateCreated: -1, createdAt: -1 })
        .lean()

    const subjectIds = subjects.map((s) => s._id)
    const publishedCourses = subjectIds.length === 0
        ? []
        : await Course.find({
            subject: { $in: subjectIds },
            isPublish: true,
        })
            .select('title description isPublish subject')
            .sort({ createdAt: -1 })
            .lean()

    const coursesBySubjectId = new Map()
    for (const c of publishedCourses) {
        const sid = String(c.subject)
        if (!coursesBySubjectId.has(sid)) {
            coursesBySubjectId.set(sid, [])
        }
        coursesBySubjectId.get(sid).push({
            _id: c._id,
            title: c.title,
            description: c.description,
            isPublish: c.isPublish,
        })
    }

    res.status(200).json(
        subjects.map((subj) => ({
            ...subjectToJson(subj),
            courses: coursesBySubjectId.get(String(subj._id)) ?? [],
        })),
    )
})



export {
    authStudent,
    registerStudent,
    logoutStudent,
    GetStudentProfile,
    updateStudentProfile,
    getMySubjects,
};