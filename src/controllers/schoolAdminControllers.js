import asyncHandler from 'express-async-handler';
import SchoolAdmin from '../models/schoolAdminModel.js';
import generateToken from '../utils/generateToken.js';


// POST /api/schooladmin/login
const authSchoolAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const schoolAdmin = await SchoolAdmin.findOne({ email })

    if(schoolAdmin && (await schoolAdmin.matchPassword(password))) {
        generateToken(res, schoolAdmin._id);

        res.json({
            _id: schoolAdmin._id,
            firstname: schoolAdmin.firstname,
            lastname: schoolAdmin.lastname,
            email: schoolAdmin.email,
            jobtitle: schoolAdmin.jobtitle,
            about: schoolAdmin.about,
            signInDate: schoolAdmin.signInDate,
            school: schoolAdmin.school,
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})



// POST /api/schooladmin/register
const registerSchoolAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const schoolAdminExist = await SchoolAdmin.findOne({ email })

    if(schoolAdminExist) {
        res.status(400)
        throw new Error('school admin already exists')
    }


    const schoolAdmin = await SchoolAdmin.create({
        firstname: req.body.firstname.toLowerCase(),
        lastname: req.body.lastname.toLowerCase(),
        email,
        password,
        role: 'admin',
        jobtitle: '',
        signInDate: new Date(),
    })

    if(schoolAdmin) {

        generateToken(res, schoolAdmin._id);

        res.status(201).json({
            _id: schoolAdmin._id,
            firstname: schoolAdmin.firstname,
            lastname: schoolAdmin.lastname,
            email: schoolAdmin.email,
            jobtitle: schoolAdmin.jobtitle,
            about: schoolAdmin.about,
            signInDate: schoolAdmin.signInDate,
            school: schoolAdmin.school,
        })
    } else{
        res.status(400)
        throw new Error('Invalid school admin data')
    }
})

// POST /api/schooladmin/logout
const logoutSchoolAdmin = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
});

// PUT /api/schooladmins/profile
const updateSchoolAdminProfile = asyncHandler(async (req, res) => { 
    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id)

    if (!schoolAdmin) {
        res.status(404)
        throw new Error('School admin not found')
    }

    if (req.body.firstname !== undefined && req.body.firstname !== '') {
        schoolAdmin.firstname = String(req.body.firstname).toLowerCase()
    }
    if (req.body.lastname !== undefined && req.body.lastname !== '') {
        schoolAdmin.lastname = String(req.body.lastname).toLowerCase()
    }
    if (req.body.email !== undefined && req.body.email !== '') {
        schoolAdmin.email = req.body.email
    }
    if (req.body.jobtitle !== undefined) {
        schoolAdmin.jobtitle = String(req.body.jobtitle).trim()
    }
    if (req.body.about !== undefined) {
        schoolAdmin.about = req.body.about
    }

    if (req.body.password && String(req.body.password).trim() !== '') {
        schoolAdmin.password = req.body.password
    }

    const updatedSchoolAdmin = await schoolAdmin.save()

    res.status(200).json({
        _id: updatedSchoolAdmin._id,
        firstname: updatedSchoolAdmin.firstname,
        lastname: updatedSchoolAdmin.lastname,
        email: updatedSchoolAdmin.email,
        jobtitle: updatedSchoolAdmin.jobtitle,
        about: updatedSchoolAdmin.about,
        signInDate: updatedSchoolAdmin.signInDate,
        school: updatedSchoolAdmin.school,
    })
});

export { 
    authSchoolAdmin, 
    registerSchoolAdmin,
    logoutSchoolAdmin,
    updateSchoolAdminProfile,
}
