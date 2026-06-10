import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import School from '../models/schoolModel.js';
import SchoolAdmin from '../models/schoolAdminModel.js';
import Teacher from '../models/teacherModel.js';
import Student from '../models/studentModel.js';
import Plan from '../models/planModel.js';
import Subject from '../models/subjectModel.js';
import {
    gradeLevelToJson,
    gradeLevelsToJson,
    syncSchoolGradeLevels,
} from '../utils/gradeLevelHelpers.js';
import { generateUniqueStudentUsername } from '../utils/studentUsername.js';

const VALID_SCHOOL_TYPES = ['high school', 'university'];

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

async function assertSchoolAdminOwnsSchool (res, schoolAdminId, schoolId) {
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    const schoolAdmin = await SchoolAdmin.findById(schoolAdminId);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const school = await School.findById(schoolId);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== String(schoolAdminId)) {
        res.status(403);
        throw new Error('Not authorized for this school');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== String(schoolId)
    ) {
        res.status(403);
        throw new Error('Not authorized for this school');
    }

    return { schoolAdmin, school };
}

async function populateSchoolGradeLevels (school) {
    return School.findById(school._id).populate('gradesLevels', 'name');
}

// POST /api/schools — use with protectSchoolAdmin; links school ↔ admin
const createSchool = asyncHandler(async (req, res) => {
    const { name, country, city, address, schoolType } = req.body;

    if (!name || String(name).trim() === '') {
        res.status(400);
        throw new Error('School name is required');
    }

    if (!country || String(country).trim() === '') {
        res.status(400);
        throw new Error('Country is required');
    }

    if (!city || String(city).trim() === '') {
        res.status(400);
        throw new Error('City is required');
    }

    if (!schoolType || String(schoolType).trim() === '') {
        res.status(400);
        throw new Error('School type is required');
    }

    if (!VALID_SCHOOL_TYPES.includes(schoolType)) {
        res.status(400);
        throw new Error('schoolType must be high school or university');
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    if (schoolAdmin.school) {
        res.status(400);
        throw new Error('School admin already has a school registered');
    }

    const school = await School.create({
        name: String(name).trim(),
        country: String(country).trim(),
        city: String(city).trim(),
        address: address !== undefined ? String(address).trim() : undefined,
        schoolType,
        signInDate: new Date(),
        admin: schoolAdmin._id,
    });

    schoolAdmin.school = school._id;
    await schoolAdmin.save();

    const populatedSchool = await populateSchoolGradeLevels(school);

    res.status(201).json({
        _id: populatedSchool._id,
        name: populatedSchool.name,
        country: populatedSchool.country,
        city: populatedSchool.city,
        address: populatedSchool.address,
        schoolType: populatedSchool.schoolType,
        gradesLevels: gradeLevelsToJson(populatedSchool.gradesLevels),
        signInDate: populatedSchool.signInDate,
        admin: populatedSchool.admin,
    });
});

// GET /api/schools/:id — use with protectSchoolAdmin; admin must own the school
const getSchoolById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    const school = await School.findById(id).populate('gradesLevels', 'name');

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this school');
    }

    res.status(200).json({
        _id: school._id,
        name: school.name,
        country: school.country,
        city: school.city,
        address: school.address,
        schoolType: school.schoolType,
        gradesLevels: gradeLevelsToJson(school.gradesLevels),
        signInDate: school.signInDate,
        admin: school.admin,
    });
});

// PUT /api/schools/:id — use with protectSchoolAdmin; admin must own the school
const updateSchoolById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    const school = await School.findById(id);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this school');
    }

    const { name, country, city, address, schoolType, gradesLevels } = req.body;

    if (!name || String(name).trim() === '') {
        res.status(400);
        throw new Error('School name is required');
    }

    if (!country || String(country).trim() === '') {
        res.status(400);
        throw new Error('Country is required');
    }

    if (!city || String(city).trim() === '') {
        res.status(400);
        throw new Error('City is required');
    }

    if (!schoolType || String(schoolType).trim() === '') {
        res.status(400);
        throw new Error('School type is required');
    }

    if (!VALID_SCHOOL_TYPES.includes(schoolType)) {
        res.status(400);
        throw new Error('schoolType must be high school or university');
    }

    if (!Array.isArray(gradesLevels) || gradesLevels.length === 0) {
        res.status(400);
        throw new Error('At least one grade level is required');
    }

    const hasValidGradeLevel = gradesLevels.some((item) => {
        if (typeof item === 'string') {
            return item.trim() !== '';
        }
        if (item && typeof item === 'object') {
            return String(item.name ?? '').trim() !== '';
        }
        return false;
    });

    if (!hasValidGradeLevel) {
        res.status(400);
        throw new Error('At least one grade level is required');
    }

    school.name = String(name).trim();
    school.country = String(country).trim();
    school.city = String(city).trim();
    school.schoolType = schoolType;
    if (address !== undefined) {
        school.address = String(address).trim();
    }

    const synced = await syncSchoolGradeLevels(school, gradesLevels);
    if (synced.error) {
        res.status(400);
        throw new Error(synced.error);
    }

    if (!school.gradesLevels || school.gradesLevels.length === 0) {
        res.status(400);
        throw new Error('At least one grade level is required');
    }

    const updatedSchool = await school.save();
    const populatedSchool = await populateSchoolGradeLevels(updatedSchool);

    res.status(200).json({
        _id: populatedSchool._id,
        name: populatedSchool.name,
        country: populatedSchool.country,
        city: populatedSchool.city,
        address: populatedSchool.address,
        schoolType: populatedSchool.schoolType,
        gradesLevels: gradeLevelsToJson(populatedSchool.gradesLevels),
        signInDate: populatedSchool.signInDate,
        admin: populatedSchool.admin,
    });
});

// POST /api/schools/:id/teachers — use with protectSchoolAdmin
const addTeacherToSchool = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, firstname, lastname } = req.body;

    const { school } = await assertSchoolAdminOwnsSchool(
        res,
        req.schoolAdmin._id,
        id,
    );

    if (!firstname || String(firstname).trim() === '') {
        res.status(400);
        throw new Error('First name is required');
    }

    if (!lastname || String(lastname).trim() === '') {
        res.status(400);
        throw new Error('Last name is required');
    }

    if (!email || String(email).trim() === '') {
        res.status(400);
        throw new Error('Email is required');
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        res.status(400);
        throw new Error('Invalid email address');
    }

    const emailRegex = buildEmailExactRegex(trimmedEmail);
    const existingTeacher = emailRegex
        ? await Teacher.findOne({ email: emailRegex })
        : null;

    let teacher;

    if (existingTeacher) {
        const alreadyLinked = (school.teachers ?? []).some(
            (tid) => String(tid) === String(existingTeacher._id),
        );

        if (alreadyLinked) {
            res.status(400);
            throw new Error('This teacher is already in your school');
        }

        if (
            existingTeacher.school
            && String(existingTeacher.school) !== String(school._id)
        ) {
            res.status(400);
            throw new Error('A teacher with this email belongs to another school');
        }

        existingTeacher.firstname = String(firstname).trim().toLowerCase();
        existingTeacher.lastname = String(lastname).trim().toLowerCase();
        existingTeacher.email = trimmedEmail;
        existingTeacher.school = school._id;
        teacher = await existingTeacher.save();
    } else {
        teacher = await Teacher.create({
            firstname: String(firstname).trim().toLowerCase(),
            lastname: String(lastname).trim().toLowerCase(),
            email: trimmedEmail,
            role: 'teacher',
            image: 'none',
            signInDate: new Date(),
            school: school._id,
        });
    }

    await School.updateOne(
        { _id: school._id },
        { $addToSet: { teachers: teacher._id } },
    );

    res.status(201).json({
        _id: teacher._id,
        firstname: teacher.firstname,
        lastname: teacher.lastname,
        email: teacher.email,
        school: teacher.school,
        signInDate: teacher.signInDate,
    });
});

// GET /api/schools/:id/teachers — use with protectSchoolAdmin
const getTeachersBySchool = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await assertSchoolAdminOwnsSchool(
        res,
        req.schoolAdmin._id,
        id,
    );

    const teachers = await Teacher.find({ school: id })
        .select('firstname lastname email signInDate createdAt')
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json(
        teachers.map((teacher) => ({
            _id: teacher._id,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            signInDate: teacher.signInDate,
            createdAt: teacher.createdAt,
        })),
    );
});

function schoolGradeLevelIds (school) {
    return (school.gradesLevels ?? []).map((id) => String(id));
}

async function assertGradeLevelBelongsToSchool (
    res,
    school,
    gradesLevelId,
) {
    if (!mongoose.Types.ObjectId.isValid(gradesLevelId)) {
        res.status(400);
        throw new Error('Invalid grade level');
    }

    const allowed = schoolGradeLevelIds(school);
    if (!allowed.includes(String(gradesLevelId))) {
        res.status(400);
        throw new Error('Grade level must belong to your school');
    }
}

async function assertPlanBelongsToSchoolAndGrade (
    res,
    school,
    planId,
    gradesLevelId,
) {
    if (!mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400);
        throw new Error('Invalid plan');
    }

    const plan = await Plan.findById(planId).select(
        'school gradesLevel active subjects',
    );

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    if (String(plan.school) !== String(school._id)) {
        res.status(403);
        throw new Error('This plan does not belong to your school');
    }

    if (plan.active === false) {
        res.status(400);
        throw new Error('This plan is not active');
    }

    if (
        plan.gradesLevel
        && String(plan.gradesLevel) !== String(gradesLevelId)
    ) {
        res.status(400);
        throw new Error('This plan is for a different grade level');
    }

    return plan;
}

async function linkStudentToPlanAndSubjects (
    studentDoc,
    planDoc,
    normalizedEmail,
) {
    const subjectIds = (planDoc.subjects ?? []).map((id) => id);

    await Plan.updateOne(
        { _id: planDoc._id },
        { $addToSet: { students: studentDoc._id } },
    );

    await Student.updateOne(
        { _id: studentDoc._id },
        { $addToSet: { plans: planDoc._id } },
    );

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

function studentListItemJson (student) {
    const plans = student.plans ?? [];
    const primaryPlan = plans.length > 0 ? plans[0] : null;

    return {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email ?? null,
        username: student.username ?? null,
        signInDate: student.signInDate,
        createdAt: student.createdAt,
        gradesLevel: gradeLevelToJson(student.gradesLevel),
        plan:
            primaryPlan != null && typeof primaryPlan === 'object'
                ? {
                    _id: primaryPlan._id,
                    price: primaryPlan.price,
                    totalQuestions: primaryPlan.totalQuestions,
                    active: primaryPlan.active,
                }
                : null,
    };
}

// POST /api/schools/:id/students — use with protectSchoolAdmin
const addStudentToSchool = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        email,
        firstname,
        lastname,
        gradesLevel: gradesLevelFromBody,
        plan: planFromBody,
    } = req.body;

    const { school } = await assertSchoolAdminOwnsSchool(
        res,
        req.schoolAdmin._id,
        id,
    );

    if (!firstname || String(firstname).trim() === '') {
        res.status(400);
        throw new Error('First name is required');
    }

    if (!lastname || String(lastname).trim() === '') {
        res.status(400);
        throw new Error('Last name is required');
    }

    if (
        gradesLevelFromBody === undefined
        || gradesLevelFromBody === null
        || String(gradesLevelFromBody).trim() === ''
    ) {
        res.status(400);
        throw new Error('Grade level is required');
    }

    if (
        planFromBody === undefined
        || planFromBody === null
        || String(planFromBody).trim() === ''
    ) {
        res.status(400);
        throw new Error('Plan is required');
    }

    const emailTrimmed = email != null ? String(email).trim() : '';
    const trimmedEmail = emailTrimmed !== ''
        ? emailTrimmed.toLowerCase()
        : null;
    if (
        trimmedEmail != null
        && !/^\S+@\S+\.\S+$/.test(trimmedEmail)
    ) {
        res.status(400);
        throw new Error('Invalid email address');
    }

    const gradesLevelId = String(gradesLevelFromBody).trim();
    await assertGradeLevelBelongsToSchool(res, school, gradesLevelId);

    const plan = await assertPlanBelongsToSchoolAndGrade(
        res,
        school,
        String(planFromBody).trim(),
        gradesLevelId,
    );

    const emailRegex = trimmedEmail
        ? buildEmailExactRegex(trimmedEmail)
        : null;
    const existingStudent = emailRegex
        ? await Student.findOne({ email: emailRegex })
        : null;

    let student;

    if (existingStudent) {
        const alreadyLinked = (school.students ?? []).some(
            (sid) => String(sid) === String(existingStudent._id),
        );

        if (alreadyLinked) {
            const hasPlan = (existingStudent.plans ?? []).some(
                (pid) => String(pid) === String(plan._id),
            );
            if (hasPlan) {
                res.status(400);
                throw new Error(
                    'This student is already in your school with this plan',
                );
            }
        } else if (
            existingStudent.school
            && String(existingStudent.school) !== String(school._id)
        ) {
            res.status(400);
            throw new Error(
                'A student with this email belongs to another school',
            );
        }

        existingStudent.firstname = String(firstname).trim().toLowerCase();
        existingStudent.lastname = String(lastname).trim().toLowerCase();
        if (trimmedEmail != null) {
            existingStudent.email = trimmedEmail;
        }
        existingStudent.school = school._id;
        existingStudent.gradesLevel = gradesLevelId;
        if (
            !existingStudent.username
            || String(existingStudent.username).trim() === ''
        ) {
            existingStudent.username = await generateUniqueStudentUsername({
                firstname,
                lastname,
                excludeStudentId: existingStudent._id,
            });
        }
        student = await existingStudent.save();
    } else {
        const username = await generateUniqueStudentUsername({
            firstname,
            lastname,
        });
        const createPayload = {
            firstname: String(firstname).trim().toLowerCase(),
            lastname: String(lastname).trim().toLowerCase(),
            username,
            role: 'student',
            school: school._id,
            gradesLevel: gradesLevelId,
            signInDate: new Date(),
            plans: [plan._id],
        };
        if (trimmedEmail != null) {
            createPayload.email = trimmedEmail;
        }
        student = await Student.create(createPayload);
    }

    await linkStudentToPlanAndSubjects(
        student,
        plan,
        trimmedEmail ?? '',
    );

    await School.updateOne(
        { _id: school._id },
        { $addToSet: { students: student._id } },
    );

    const populated = await Student.findById(student._id)
        .select(
            'firstname lastname email username signInDate createdAt gradesLevel plans',
        )
        .populate('gradesLevel', 'name')
        .populate({
            path: 'plans',
            select: 'price totalQuestions active',
            options: { sort: { createdAt: -1 } },
        })
        .lean();

    res.status(201).json(studentListItemJson(populated));
});

// GET /api/schools/:id/students — use with protectSchoolAdmin
const getStudentsBySchool = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await assertSchoolAdminOwnsSchool(
        res,
        req.schoolAdmin._id,
        id,
    );

    const students = await Student.find({ school: id })
        .select(
            'firstname lastname email username signInDate createdAt gradesLevel plans',
        )
        .populate('gradesLevel', 'name')
        .populate({
            path: 'plans',
            select: 'price totalQuestions active',
            options: { sort: { createdAt: -1 } },
        })
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json(students.map((s) => studentListItemJson(s)));
});

export {
    createSchool,
    getSchoolById,
    updateSchoolById,
    addTeacherToSchool,
    getTeachersBySchool,
    addStudentToSchool,
    getStudentsBySchool,
    assertSchoolAdminOwnsSchool,
};
