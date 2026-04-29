import express from 'express';
import { protectSchoolAdmin, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherSubjectMultipart } from '../middleware/teacherSubjectUpload.js';
import {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    getSubjectStudentsForTeacher,
    updateSubjectById,
    updateSubjectByTeacher,
    addSubjectStudentEmailForTeacher,
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

router.get(
    '/:id/teacher/students',
    protectTeacher,
    getSubjectStudentsForTeacher,
);

router.put(
    '/:id/teacher/student-email',
    protectTeacher,
    addSubjectStudentEmailForTeacher,
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
