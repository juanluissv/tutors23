import express from 'express';
import { protectSchoolAdmin, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherSubjectMultipart } from '../middleware/teacherSubjectUpload.js';
import {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    updateSubjectById,
    updateSubjectByTeacher,
    setSubjectTeacherEmail,
} from '../controllers/subjectController.js';

const router = express.Router();

router
    .route('/school/:schoolId')
    .get(protectSchoolAdmin, getSubjectsBySchool);

router
    .route('/teacher/:teacherId')
    .get(protectTeacher, getSubjectsByTeacherId);

router
    .route('/:id/teacher-email')
    .put(protectSchoolAdmin, setSubjectTeacherEmail);

router
    .get(
        '/:id/teacher/book',
        protectTeacher,
        getSubjectBookForTeacher,
    );

router
    .route('/:id/teacher')
    .put(
        protectTeacher,
        parseTeacherSubjectMultipart,
        updateSubjectByTeacher,
    );

router
    .route('/:id')
    .put(protectSchoolAdmin, updateSubjectById);

router.route('/').post(protectSchoolAdmin, createSubject);

export default router;
