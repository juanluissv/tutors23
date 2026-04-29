import asyncHandler from 'express-async-handler';
import Student from '../models/studentModel.js';
import Subject from '../models/subjectModel.js';
import generateToken from '../utils/generateToken.js';



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


// GET /api/students/profile
const GetStudentProfile = asyncHandler(async (req, res) => {

    const student = await Student.findById(req.student._id)

    if(student) {
        res.json({
            _id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            subscriptions: student.subscriptions,
            city: student.city,
            country: student.country,
        })
    } else {
        res.status(404)
        throw new Error('Student not found')
    }
});


// PUT /api/student/profile
const updateStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id)

    if(student) {
        student.firstname = req.body.firstname || student.firstname
        student.lastname = req.body.lastname || student.lastname
        student.email = req.body.email || student.email
        student.city = req.body.city || student.city
        student.country = req.body.country || student.country
        student.subscriptions = req.body.subscriptions || student.subscriptions

        if(req.body.password) {
            student.password = req.body.password
        }

        const updatedStudent = await student.save()

        res.json({
            _id: updatedStudent._id,
            firstname: updatedStudent.firstname,
            lastname: updatedStudent.lastname,
            email: updatedStudent.email,
            city: updatedStudent.city,
            country: updatedStudent.country,
            subscriptions: updatedStudent.subscriptions,          


        })
    } else {
        res.status(404)
        throw new Error('Student not found')
    }
});



export { authStudent, registerStudent, logoutStudent, GetStudentProfile, updateStudentProfile };