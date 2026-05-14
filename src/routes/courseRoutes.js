import express from 'express';
import { protectStudent, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherAnswerVideo } from '../middleware/teacherAnswerVideoUpload.js';
import {
	addLessonToCourse,
	addSectionToCourse,
	createCourse,
	getPublishedCoursesBySubjectForStudent,
	getCourseByIdForTeacher,
	getCoursePreviewForTeacher,
	getCourseWatchForStudent,
	getCoursesBySubjectForTeacher,
	setCoursePublishForTeacher,
} from '../controllers/courseController.js';

const router = express.Router();

router.get(
	'/student/subject/:subjectId',
	protectStudent,
	getPublishedCoursesBySubjectForStudent,
);

router.get(
	'/subject/:subjectId',
	protectTeacher,
	getCoursesBySubjectForTeacher,
);

router
	.route('/:courseId/sections')
	.post(protectTeacher, addSectionToCourse);

router
	.route('/:courseId/lessons')
	.post(
		protectTeacher,
		parseTeacherAnswerVideo,
		addLessonToCourse,
	);

router.get('/:courseId/preview', protectTeacher, getCoursePreviewForTeacher);

router.patch(
	'/:courseId/publish',
	protectTeacher,
	setCoursePublishForTeacher,
);

router.get('/:courseId/watch', protectStudent, getCourseWatchForStudent);

router
	.route('/:courseId')
	.get(protectTeacher, getCourseByIdForTeacher);

router.route('/').post(protectTeacher, createCourse);

export default router;
