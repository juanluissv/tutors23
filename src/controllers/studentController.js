import asyncHandler from 'express-async-handler';
import Student from '../models/studentModel.js';
import Subject from '../models/subjectModel.js';
import generateToken from '../utils/generateToken.js';
import { subjectToJson } from './subjectController.js';



function normalizeStudentEmail (raw) {
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

// POST /api/students/login
const authStudent = asyncHandler(async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const emailNorm = normalizeStudentEmail(rawEmail);
    const emailRegex = buildEmailExactRegex(emailNorm);
    const student = emailRegex
        ? await Student.findOne({ email: emailRegex })
        : null;

    if(student && (await student.matchPassword(password))) {
        await ensureStudentSubjectsLinkedFromInviteEmail(student, emailNorm);

        const fresh = await Student.findById(student._id).select('-password');

        generateToken(res, fresh._id);
        res.json({
            _id: fresh._id,
            firstname: fresh.firstname,
            lastname: fresh.lastname,
            email: fresh.email,
            country: fresh.country,
            city: fresh.city,
            subscriptions: fresh.subscriptions,
            subjects: fresh.subjects ?? [],
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

// POST /api/students/register
const registerStudent = asyncHandler(async (req, res) => {
    const {
        email: rawEmail,
        password,
        firstname: rawFirstname,
        lastname: rawLastname,
    } = req.body;

    const email = normalizeStudentEmail(rawEmail);
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }
    if (!looksLikeEmail(email)) {
        res.status(400);
        throw new Error('Please enter a valid email address');
    }

    const pwd = String(password ?? '');
    if (pwd.trim() === '') {
        res.status(400);
        throw new Error('Password is required');
    }
   

    const dupRegex = buildEmailExactRegex(email);
    if (dupRegex) {
        const existing = await Student.findOne({ email: dupRegex });
        if (existing) {
            res.status(400);
            throw new Error('A student with this email already exists');
        }
    }
    

    const firstTrim =
        rawFirstname != null ? String(rawFirstname).trim() : '';
    const lastTrim =
        rawLastname != null ? String(rawLastname).trim() : '';
    const local = email.split('@')[0] || '';
    const localParts = local.split(/[._-]+/).filter(Boolean);
    const firstname = (
        firstTrim
        || localParts[0]
        || 'student'
    ).toLowerCase();
    const lastname = (
        lastTrim
        || localParts.slice(1).join(' ')
        || 'student'
    ).toLowerCase();

    const student = await Student.create({
        role: 'student',
        firstname,
        lastname,
        email,
        password: pwd,
        signInDate: new Date(),
    });

    await ensureStudentSubjectsLinkedFromInviteEmail(student, email);

    const saved = await Student.findById(student._id).select('-password');

    generateToken(res, saved._id);
    res.status(201).json({
        _id: saved._id,
        firstname: saved.firstname,
        lastname: saved.lastname,
        email: saved.email,
        subjects: saved.subjects ?? [],
    });
})


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
        email: doc.email,
        subscriptions: doc.subscriptions ?? [],
        city: doc.city ?? '',
        country: doc.country ?? '',
        birthDate: birth,
        subjects: doc.subjects ?? [],
    }
}

// GET /api/students/profile
const GetStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id)
        .select('-password')
        .populate('subjects', 'title description grade')

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
        .populate('subjects', 'title description grade')

    res.json(studentProfileResponse(updated))
})

// GET /api/students/mysubjects
const getMySubjects = asyncHandler(async (req, res) => {
    const studentId = req.student._id
    const subjects = await Subject.find({ students: studentId })
        .sort({ dateCreated: -1, createdAt: -1 })
        .lean()
    res.status(200).json(subjects.map(subjectToJson))
})



export {
    authStudent,
    registerStudent,
    logoutStudent,
    GetStudentProfile,
    updateStudentProfile,
    getMySubjects,
};