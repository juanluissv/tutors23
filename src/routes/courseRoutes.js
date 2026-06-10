import express from 'express';
import { protectStudent, protectSchoolAdmin, protectTeacher } from '../middleware/authMiddleware.js';
import { parseTeacherAnswerVideo } from '../middleware/teacherAnswerVideoUpload.js';
import {
	addLessonToCourse,
	addSectionToCourse,
	createCourse,
	getPublishedCoursesBySubjectForStudent,
	getCourseByIdForTeacher,
	getCoursePreviewForTeacher,
	getCoursePreviewForSchoolAdmin,
	getCourseWatchForStudent,
	getCoursesBySubjectForTeacher,
	getCoursesBySubjectForSchoolAdmin,
	setCoursePublishForTeacher,
} from '../controllers/courseController.js';

const router = express.Router();

router.get(
	'/student/subject/:subjectId',
	protectStudent,
	getPublishedCoursesBySubjectForStudent,
);

router.get(
	'/school-admin/subject/:subjectId',
	protectSchoolAdmin,
	getCoursesBySubjectForSchoolAdmin,
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

router.get(
	'/:courseId/school-admin/preview',
	protectSchoolAdmin,
	getCoursePreviewForSchoolAdmin,
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
