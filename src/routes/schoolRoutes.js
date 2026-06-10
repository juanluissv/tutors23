import express from 'express';
import { protectSchoolAdmin } from '../middleware/authMiddleware.js';
import {
    createSchool,
    getSchoolById,
    updateSchoolById,
    addTeacherToSchool,
    getTeachersBySchool,
    addStudentToSchool,
    getStudentsBySchool,
} from '../controllers/schoolController.js';
import { getSchoolEarnings } from '../controllers/earningsController.js';

const router = express.Router();

router.route('/').post(protectSchoolAdmin, createSchool);
router
    .route('/:id/teachers')
    .get(protectSchoolAdmin, getTeachersBySchool)
    .post(protectSchoolAdmin, addTeacherToSchool);
router
    .route('/:id/students')
    .get(protectSchoolAdmin, getStudentsBySchool)
    .post(protectSchoolAdmin, addStudentToSchool);
router
    .route('/:id/earnings')
    .get(protectSchoolAdmin, getSchoolEarnings);
router
    .route('/:id')
    .get(protectSchoolAdmin, getSchoolById)
    .put(protectSchoolAdmin, updateSchoolById);

export default router;
