import asyncHandler from 'express-async-handler';
import Subject from '../models/subjectModel.js';
import Teacher from '../models/teacherModel.js';
import generateToken from '../utils/generateToken.js';

const subjectWithGradeLevelPopulate = {
    path: 'subjects',
    select: 'title description gradesLevel school',
    populate: {
        path: 'gradesLevel',
        select: 'name',
    },
};

// Case-insensitive exact match (teacherEmail in DB is usually trimmed + lowercased)
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

/**
 * If this email appears in subject.teacherEmail (invite list), attach this
 * teacher to those subjects and vice versa. Idempotent via $addToSet.
 */
async function ensureTeacherSubjectsLinkedFromInviteEmail (teacherDoc, rawEmail) {
    const emailRegex = buildEmailExactRegex(rawEmail);
    if (!emailRegex) {
        return;
    }

    const linkedSubjects = await Subject.find({ teacherEmail: emailRegex })
        .select('_id')
        .lean();

    if (!linkedSubjects.length) {
        return;
    }

    const subjectIds = linkedSubjects.map((s) => s._id);

    await Subject.updateMany(
        { _id: { $in: subjectIds } },
        { $addToSet: { teachers: teacherDoc._id } },
    );

    await Teacher.updateOne(
        { _id: teacherDoc._id },
        { $addToSet: { subjects: { $each: subjectIds } } },
    );
}

function teacherProfileResponse (teacherDoc) {
    return {
        _id: teacherDoc._id,
        firstname: teacherDoc.firstname,
        lastname: teacherDoc.lastname,
        email: teacherDoc.email,
        image: teacherDoc.image,
        subjects: teacherDoc.subjects ?? [],
    };
}

// GET /api/teachers/profile
const getTeacherProfile = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.teacher._id)
        .select('-password')
        .populate(subjectWithGradeLevelPopulate);

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    res.json(teacherProfileResponse(teacher));
});

// PUT /api/teachers/profile
const updateTeacherProfile = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.teacher._id);

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    if (req.body.firstname !== undefined && req.body.firstname !== '') {
        teacher.firstname = String(req.body.firstname).toLowerCase();
    }
    if (req.body.lastname !== undefined && req.body.lastname !== '') {
        teacher.lastname = String(req.body.lastname).toLowerCase();
    }
    if (req.body.email !== undefined && req.body.email !== '') {
        const nextEmail = String(req.body.email).trim();
        const taken = await Teacher.findOne({
            email: nextEmail,
            _id: { $ne: teacher._id },
        });
        if (taken) {
            res.status(400);
            throw new Error('Email already in use');
        }
        teacher.email = nextEmail;
    }
    if (req.body.image !== undefined) {
        teacher.image = String(req.body.image).trim();
    }

    if (req.body.password && String(req.body.password).trim() !== '') {
        teacher.password = req.body.password;
    }

    const updated = await teacher.save();
    const withSubjects = await Teacher.findById(updated._id)
        .select('-password')
        .populate(subjectWithGradeLevelPopulate);

    res.json(teacherProfileResponse(withSubjects));
});

// POST /api/teachers/login
const authTeacher = asyncHandler(async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const emailRegex = buildEmailExactRegex(rawEmail);
    const teacher = emailRegex
        ? await Teacher.findOne({ email: emailRegex })
        : null;

    if (teacher && (await teacher.matchPassword(password))) {
        await ensureTeacherSubjectsLinkedFromInviteEmail(teacher, rawEmail);

        const fresh = await Teacher.findById(teacher._id).select('-password');

        generateToken(res, fresh._id);

        res.json({
            _id: fresh._id,
            firstname: fresh.firstname,
            lastname: fresh.lastname,
            email: fresh.email,
            image: fresh.image,
            subjects: fresh.subjects ?? [],
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})



function isTeacherRegistrationComplete (teacherDoc) {
    const pwd = teacherDoc?.password;
    return typeof pwd === 'string' && pwd.trim() !== '';
}

// POST /api/teachers/register
const registerTeacher = asyncHandler(async (req, res) => {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || String(rawEmail).trim() === '') {
        res.status(400);
        throw new Error('Email is required');
    }

    if (!password || String(password).trim() === '') {
        res.status(400);
        throw new Error('Password is required');
    }

    const trimmedEmail = String(rawEmail).trim().toLowerCase();
    const emailRegex = buildEmailExactRegex(trimmedEmail);
    const existingTeacher = emailRegex
        ? await Teacher.findOne({ email: emailRegex })
        : null;

    let teacher;
    let completedPendingAccount = false;

    if (existingTeacher) {
        if (isTeacherRegistrationComplete(existingTeacher)) {
            res.status(400);
            throw new Error(
                'An account with this email already exists. Please sign in.',
            );
        }

        existingTeacher.firstname = String(req.body.firstname).trim().toLowerCase();
        existingTeacher.lastname = String(req.body.lastname).trim().toLowerCase();
        existingTeacher.email = trimmedEmail;
        existingTeacher.password = password;
        existingTeacher.signInDate = new Date();
        if (!existingTeacher.role) {
            existingTeacher.role = 'teacher';
        }
        if (!existingTeacher.image || String(existingTeacher.image).trim() === '') {
            existingTeacher.image = 'none';
        }

        teacher = await existingTeacher.save();
        completedPendingAccount = true;
    } else {
        teacher = await Teacher.create({
            firstname: String(req.body.firstname).trim().toLowerCase(),
            lastname: String(req.body.lastname).trim().toLowerCase(),
            role: 'teacher',
            email: trimmedEmail,
            image: 'none',
            signInDate: new Date(),
            password,
        });
    }

    await ensureTeacherSubjectsLinkedFromInviteEmail(teacher, trimmedEmail);

    const saved = await Teacher.findById(teacher._id).select('-password');

    generateToken(res, saved._id);

    res.status(completedPendingAccount ? 200 : 201).json({
        _id: saved._id,
        firstname: saved.firstname,
        lastname: saved.lastname,
        email: saved.email,
        image: saved.image,
        subjects: saved.subjects ?? [],
        accountCompleted: completedPendingAccount,
    });
});

// POST /api/teacher/logout
const logoutTeacher = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
});

export {
    authTeacher,
    registerTeacher,
    logoutTeacher,
    getTeacherProfile,
    updateTeacherProfile,
}
