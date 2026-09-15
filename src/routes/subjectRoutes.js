import express from 'express';
import { protectSchoolAdmin, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherSubjectMultipart, parseChapterFileMultipart, parseSubjectDocumentMultipart } from '../middleware/teacherSubjectUpload.js';
import {
    createSubject,
    getSubjectsBySchool,
    getSubjectsByTeacherId,
    getSubjectBookForTeacher,
    getSubjectBookForSchoolAdmin,
    getSubjectDocumentForSchoolAdmin,
    getSubjectDocumentForTeacher,
    getSubjectStudentsForTeacher,
    getSubjectStudentsForSchoolAdmin,
    updateSubjectById,
    updateSubjectByTeacher,
    updateSubjectBookChapters,
    generateSubjectBookChapterPdf,
    uploadSubjectDocument,
    uploadSubjectDocumentByTeacher,
    deleteSubjectDocument,
    deleteSubjectDocumentByTeacher,
    uploadSubjectBookChapterFile,
    deleteSubjectBookChapter,
    addSubjectStudentEmailForTeacher,
    setSubjectTeacherEmail,
} from '../controllers/subjectController.js';
import { parseChapterTutorVideo } from '../middleware/chapterTutorVideoUpload.js';
import { parseChapterTutorTranscribe } from '../middleware/chapterTutorTranscribeUpload.js';
import {
    generateBookLessonsFromChapter,
    generateChapterTutorTxtFromLesson,
    generateSuggestedQuestionsFromLesson,
    generateVideoScriptFromLesson,
    generateVideoScriptAudioFromLesson,
    generateSceneIllustrationsFromLesson,
    generateAnimatedVideoFromLesson,
    checkAnimatedVideoStatusFromLesson,
    getBookLessonsBySubject,
    getBookLessonByIdForSchoolAdmin,
    getBookLessonTranscribeForSchoolAdmin,
    uploadChapterTutorVideo,
    uploadChapterTutorTranscribe,
    uploadSuggestedQuestionVideo,
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
    '/:id/school-admin/documents/:documentId',
    protectSchoolAdmin,
    getSubjectDocumentForSchoolAdmin,
);

router.post(
    '/:id/documents',
    protectSchoolAdmin,
    parseSubjectDocumentMultipart,
    uploadSubjectDocument,
);

router.delete(
    '/:id/documents/:documentId',
    protectSchoolAdmin,
    deleteSubjectDocument,
);

router.get(
    '/:id/teacher/documents/:documentId',
    protectTeacher,
    getSubjectDocumentForTeacher,
);

router.post(
    '/:id/teacher/documents',
    protectTeacher,
    parseSubjectDocumentMultipart,
    uploadSubjectDocumentByTeacher,
);

router.delete(
    '/:id/teacher/documents/:documentId',
    protectTeacher,
    deleteSubjectDocumentByTeacher,
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

router.put(
    '/:id/teacher/book-chapters',
    protectTeacher,
    updateSubjectBookChapters,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-pdf',
    protectTeacher,
    generateSubjectBookChapterPdf,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-lessons',
    protectTeacher,
    generateBookLessonsFromChapter,
);

router.get(
    '/:id/teacher/book-lessons',
    protectTeacher,
    getBookLessonsBySubject,
);

router.get(
    '/:id/teacher/book-lessons/:lessonId',
    protectTeacher,
    getBookLessonByIdForSchoolAdmin,
);

router.get(
    '/:id/teacher/book-lessons/:lessonId/transcribe',
    protectTeacher,
    getBookLessonTranscribeForSchoolAdmin,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-tutor-txt',
    protectTeacher,
    generateChapterTutorTxtFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-suggested-questions',
    protectTeacher,
    generateSuggestedQuestionsFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-video-script',
    protectTeacher,
    generateVideoScriptFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-video-audio',
    protectTeacher,
    generateVideoScriptAudioFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-scene-illustrations',
    protectTeacher,
    generateSceneIllustrationsFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/generate-animated-video',
    protectTeacher,
    generateAnimatedVideoFromLesson,
);

router.post(
    '/:id/teacher/book-chapters/:chapterId/check-animated-video-status',
    protectTeacher,
    checkAnimatedVideoStatusFromLesson,
);

router.put(
    '/:id/teacher/book-chapters/:chapterId/tutor-video',
    protectTeacher,
    parseChapterTutorVideo,
    uploadChapterTutorVideo,
);

router.put(
    '/:id/teacher/book-chapters/:chapterId/suggested-questions/:questionIndex/:videoKind',
    protectTeacher,
    parseChapterTutorVideo,
    uploadSuggestedQuestionVideo,
);

router.put(
    '/:id/teacher/book-chapters/:chapterId/tutor-transcribe',
    protectTeacher,
    parseChapterTutorTranscribe,
    uploadChapterTutorTranscribe,
);

router.delete(
    '/:id/teacher/book-chapters/:chapterId',
    protectTeacher,
    deleteSubjectBookChapter,
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

router.post(
    '/:id/book-chapters/:chapterId/generate-tutor-txt',
    protectSchoolAdmin,
    generateChapterTutorTxtFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-suggested-questions',
    protectSchoolAdmin,
    generateSuggestedQuestionsFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-video-script',
    protectSchoolAdmin,
    generateVideoScriptFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-video-audio',
    protectSchoolAdmin,
    generateVideoScriptAudioFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-scene-illustrations',
    protectSchoolAdmin,
    generateSceneIllustrationsFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/generate-animated-video',
    protectSchoolAdmin,
    generateAnimatedVideoFromLesson,
);

router.post(
    '/:id/book-chapters/:chapterId/check-animated-video-status',
    protectSchoolAdmin,
    checkAnimatedVideoStatusFromLesson,
);

router.put(
    '/:id/book-chapters/:chapterId/tutor-video',
    protectSchoolAdmin,
    parseChapterTutorVideo,
    uploadChapterTutorVideo,
);

router.put(
    '/:id/book-chapters/:chapterId/suggested-questions/:questionIndex/:videoKind',
    protectSchoolAdmin,
    parseChapterTutorVideo,
    uploadSuggestedQuestionVideo,
);

router.put(
    '/:id/book-chapters/:chapterId/tutor-transcribe',
    protectSchoolAdmin,
    parseChapterTutorTranscribe,
    uploadChapterTutorTranscribe,
);

router.get(
    '/:id/book-lessons',
    protectSchoolAdmin,
    getBookLessonsBySubject,
);

router.get(
    '/:id/book-lessons/:lessonId/transcribe',
    protectSchoolAdmin,
    getBookLessonTranscribeForSchoolAdmin,
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
