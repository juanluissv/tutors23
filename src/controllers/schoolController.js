import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import School from '../models/schoolModel.js';
import SchoolAdmin from '../models/schoolAdminModel.js';

// POST /api/schools — use with protectSchoolAdmin; links school ↔ admin
const createSchool = asyncHandler(async (req, res) => {
    const { name, country, city, address } = req.body;

    if (!name || String(name).trim() === '') {
        res.status(400);
        throw new Error('School name is required');
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
        country: country !== undefined ? String(country).trim() : undefined,
        city: city !== undefined ? String(city).trim() : undefined,
        address: address !== undefined ? String(address).trim() : undefined,
        signInDate: new Date(),
        admin: schoolAdmin._id,
    });

    schoolAdmin.school = school._id;
    await schoolAdmin.save();

    res.status(201).json({
        _id: school._id,
        name: school.name,
        country: school.country,
        city: school.city,
        address: school.address,
        signInDate: school.signInDate,
        admin: school.admin,
    });
});

// GET /api/schools/:id — use with protectSchoolAdmin; admin must own the school
const getSchoolById = asyncHandler(async (req, res) => {
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
        throw new Error('Not authorized to view this school');
    }

    res.status(200).json({
        _id: school._id,
        name: school.name,
        country: school.country,
        city: school.city,
        address: school.address,
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

    if (req.body.name !== undefined && req.body.name !== '') {
        school.name = String(req.body.name).trim();
    }
    if (req.body.country !== undefined) {
        school.country = String(req.body.country).trim();
    }
    if (req.body.city !== undefined) {
        school.city = String(req.body.city).trim();
    }
    if (req.body.address !== undefined) {
        school.address = String(req.body.address).trim();
    }

    const updatedSchool = await school.save();

    res.status(200).json({
        _id: updatedSchool._id,
        name: updatedSchool.name,
        country: updatedSchool.country,
        city: updatedSchool.city,
        address: updatedSchool.address,
        signInDate: updatedSchool.signInDate,
        admin: updatedSchool.admin,
    });
});

export { createSchool, getSchoolById, updateSchoolById };
