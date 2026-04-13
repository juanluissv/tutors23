import asyncHandler from 'express-async-handler';
import Student from '../models/studentModel.js';
import generateToken from '../utils/generateToken.js';


// POST /api/students/login
const authStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const student = await Student.findOne({ email })

    if(student && (await student.matchPassword(password))) {
        generateToken(res, student._id);
        res.json({
            _id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            plan: student.plan,
            country: student.country,
            questions: student.numberOfQuestion,
            city: student.city,
            zipcode: student.zipcode,
            courseActive: student.courseActive,          
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

// POST /api/students/register
const registerStudent = asyncHandler(async (req, res) => {
    
    const {  email, password } = req.body;

    const studentExist = await Student.findOne({ email })

    if(studentExist) {
        res.status(400)
        throw new Error('student already exists')
    }
    

    const student = await Student.create({
        role: 'student',
        email,
        plan: ["6644eb96fc864cee203b4812"],
        password
    })

    if (student) {
        generateToken(res, student._id);
        res.status(201).json({
            _id: student._id,
            email: student.email,
            plan: student.plan,
        })
    } else{
        res.status(400)
        throw new Error('Invalid student data')
    }
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
            subscription: student.numberOfQuestion,
            city: student.city,
            zipcode: student.zipcode,
            country: student.country,
            courseActive: student.courseActive,
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
        student.zipcode = req.body.zipcode || student.zipcode
        student.country = req.body.country || student.country

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
            zipcode: updatedStudent.zipcode,
            country: updatedStudent.country,
            plan: updatedStudent.plan,
            questions: updatedStudent.numberOfQuestion,
            courseActive: updatedStudent.courseActive,          


        })
    } else {
        res.status(404)
        throw new Error('Student not found')
    }
});



export { authStudent, registerStudent, logoutStudent, GetStudentProfile, updateStudentProfile };