import asyncHandler from 'express-async-handler';
import Subject from '../models/subjectModel.js';
import Teacher from '../models/teacherModel.js';
import generateToken from '../utils/generateToken.js';

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


// POST /api/teachers/login
const authTeacher = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const teacher = await Teacher.findOne({ email })

    if(teacher && (await teacher.matchPassword(password))) {
        generateToken(res, teacher._id);

        res.json({
            _id: teacher._id,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            about: teacher.about,
            jobtitle: teacher.jobtitle,
            image: teacher.image,
            user: teacher.user,
            isPaymentSetup: teacher.isPaymentSetup,
            birthdate: teacher.birthdate,
            country: teacher.country,
            city: teacher.city,
            zipcode: teacher.zipcode,

        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})



// POST /api/teachers/register
const registerTeacher = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const teacherExist = await Teacher.findOne({ email })

    if(teacherExist) {
        res.status(400)
        throw new Error('teacher already exists')
    }

    const users = await Teacher.countDocuments({})

    const emailRegex = buildEmailExactRegex(email);
    const linkedSubjects = emailRegex
        ? await Subject.find({ teacherEmail: emailRegex }).select('_id').lean()
        : [];
    const subjectIdsFromInvites = linkedSubjects.map((s) => s._id);

    const teacher = await Teacher.create({
        firstname: req.body.firstname.toLowerCase(),
        lastname: req.body.lastname.toLowerCase(),
        role: 'teacher',
        email,
        jobtitle: '',
        about: '',
        birthdate: '',
        image: 'none',
        isPaymentSetup: false,
        country: '',
        city: '',
        signInDate : new Date(),
        user: req.body.firstname.toLowerCase() + req.body.lastname.toLowerCase() + users,
        password,
        ...(subjectIdsFromInvites.length > 0
            ? { subjects: subjectIdsFromInvites }
            : {}),
    })

    if (subjectIdsFromInvites.length > 0) {
        await Subject.updateMany(
            { _id: { $in: subjectIdsFromInvites } },
            { $addToSet: { teachers: teacher._id } },
        );
    }

    if(teacher) {

        generateToken(res, teacher._id);

        res.status(201).json({
            _id: teacher._id,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            about: teacher.about,
            jobtitle: teacher.jobtitle,
            isPaymentSetup: teacher.isPaymentSetup,
            image: teacher.image,
            user: teacher.user,
            birthdate: teacher.birthdate,
            country: teacher.country,
            city: teacher.city,
            subjects: teacher.subjects ?? [],
        })
    } else{
        res.status(400)
        throw new Error('Invalid teacher data')
    }
})

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
    logoutTeacher    
}
