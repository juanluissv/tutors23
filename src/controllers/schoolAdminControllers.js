import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import SchoolAdmin from '../models/schoolAdminModel.js';
import School from '../models/schoolModel.js';
import generateToken from '../utils/generateToken.js';
import { isSuperAdmin } from '../utils/schoolAdminAuth.js';

function schoolAdminToAuthJson (schoolAdmin, { school = null } = {}) {
	return {
		_id: schoolAdmin._id,
		firstname: schoolAdmin.firstname,
		lastname: schoolAdmin.lastname,
		email: schoolAdmin.email,
		role: schoolAdmin.role,
		jobtitle: schoolAdmin.jobtitle,
		about: schoolAdmin.about,
		signInDate: schoolAdmin.signInDate,
		school: school ?? schoolAdmin.school,
	}
}

// POST /api/schooladmin/login
const authSchoolAdmin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const schoolAdmin = await SchoolAdmin.findOne({ email })

	if (
		schoolAdmin
		&& (await schoolAdmin.matchPassword(password))
		&& !isSuperAdmin(schoolAdmin)
	) {
		generateToken(res, schoolAdmin._id);

		res.json(schoolAdminToAuthJson(schoolAdmin))
	} else if (schoolAdmin && isSuperAdmin(schoolAdmin)) {
		res.status(403)
		throw new Error(
			'Use super admin login to access the platform',
		)
	} else {
		res.status(401)
		throw new Error('Invalid email or password')
	}
})

// POST /api/schooladmins/superlogin
const authSuperAdmin = asyncHandler(async (req, res) => {
	const { email, password, schoolId } = req.body;

	if (!schoolId || !mongoose.Types.ObjectId.isValid(String(schoolId))) {
		res.status(400)
		throw new Error('A valid school is required')
	}

	const schoolAdmin = await SchoolAdmin.findOne({ email })
	const school = await School.findById(schoolId)

	if (!school) {
		res.status(404)
		throw new Error('School not found')
	}

	if (
		schoolAdmin
		&& (await schoolAdmin.matchPassword(password))
		&& isSuperAdmin(schoolAdmin)
	) {
		generateToken(res, schoolAdmin._id);

		res.json(schoolAdminToAuthJson(schoolAdmin, { school: school._id }))
	} else if (schoolAdmin && !isSuperAdmin(schoolAdmin)) {
		res.status(403)
		throw new Error('Not a super admin account')
	} else {
		res.status(401)
		throw new Error('Invalid email or password')
	}
})

// POST /api/schooladmin/register
const registerSchoolAdmin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const schoolAdminExist = await SchoolAdmin.findOne({ email })

	if (schoolAdminExist) {
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

	if (schoolAdmin) {
		generateToken(res, schoolAdmin._id);

		res.status(201).json(schoolAdminToAuthJson(schoolAdmin))
	} else {
		res.status(400)
		throw new Error('Invalid school admin data')
	}
})

// POST /api/schooladmins/superregister
const registerSuperAdmin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const schoolAdminExist = await SchoolAdmin.findOne({ email })

	if (schoolAdminExist) {
		res.status(400)
		throw new Error('super admin already exists')
	}

	const schoolAdmin = await SchoolAdmin.create({
		firstname: req.body.firstname.toLowerCase(),
		lastname: req.body.lastname.toLowerCase(),
		email,
		password,
		role: 'superadmin',
		jobtitle: '',
		signInDate: new Date(),
	})

	if (schoolAdmin) {
		generateToken(res, schoolAdmin._id);

		res.status(201).json(schoolAdminToAuthJson(schoolAdmin))
	} else {
		res.status(400)
		throw new Error('Invalid super admin data')
	}
})

// GET /api/schooladmins/superadmin/schools
const getSchoolsForSuperAdminLogin = asyncHandler(async (req, res) => {
	const schools = await School.find({})
		.select('name city country schoolType')
		.sort({ name: 1 })
		.lean()

	res.status(200).json(schools)
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

	res.status(200).json(schoolAdminToAuthJson(updatedSchoolAdmin))
});

export {
	authSchoolAdmin,
	authSuperAdmin,
	registerSchoolAdmin,
	registerSuperAdmin,
	getSchoolsForSuperAdminLogin,
	logoutSchoolAdmin,
	updateSchoolAdminProfile,
}
