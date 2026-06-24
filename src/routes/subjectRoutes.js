import express from 'express';
import { protectSchoolAdmin, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherSubjectMultipart, parseChapterFileMultipart } from '../middleware/teacherSubjectUpload.js';
import {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    getSubjectBookForSchoolAdmin,
    getSubjectStudentsForTeacher,
    getSubjectStudentsForSchoolAdmin,
    updateSubjectById,
    updateSubjectByTeacher,
    updateSubjectBookChapters,
    generateSubjectBookChapterPdf,
    uploadSubjectBookChapterFile,
    deleteSubjectBookChapter,
    addSubjectStudentEmailForTeacher,
    setSubjectTeacherEmail,
} from '../controllers/subjectController.js';
import {
    generateBookLessonsFromChapter,
    getBookLessonsBySubject,
    getBookLessonByIdForSchoolAdmin,
} from '../controllers/bookLessonsController.js';

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
    '/:id/school-admin/book',
    protectSchoolAdmin,
    getSubjectBookForSchoolAdmin,
);

router.get(
    '/:id/teacher/students',
    protectTeacher,
    getSubjectStudentsForTeacher,
);

router.get(
    '/:id/school-admin/students',
    protectSchoolAdmin,
    getSubjectStudentsForSchoolAdmin,
);

router.put(
    '/:id/teacher/student-email',
    protectTeacher,
    addSubjectStudentEmailForTeacher,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-pdf',
    protectSchoolAdmin,
    generateSubjectBookChapterPdf,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-lessons',
    protectSchoolAdmin,
    generateBookLessonsFromChapter,
);

router.get(
    '/:id/book-lessons',
    protectSchoolAdmin,
    getBookLessonsBySubject,
);

router.get(
    '/:id/book-lessons/:lessonId',
    protectSchoolAdmin,
    getBookLessonByIdForSchoolAdmin,
);

router.put(
    '/:id/book-chapters/:chapterId/file',
    protectSchoolAdmin,
    parseChapterFileMultipart,
    uploadSubjectBookChapterFile,
);

router.delete(
    '/:id/book-chapters/:chapterId',
    protectSchoolAdmin,
    deleteSubjectBookChapter,
);

router.put(
    '/:id/book-chapters',
    protectSchoolAdmin,
    updateSubjectBookChapters,
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
    .put(
        protectSchoolAdmin,
        parseTeacherSubjectMultipart,
        updateSubjectById,
    );

router.route('/').post(
    protectSchoolAdmin,
    parseTeacherSubjectMultipart,
    createSubject,
);

export default router;
