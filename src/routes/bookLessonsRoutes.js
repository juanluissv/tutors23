import express from 'express'
import { protectStudent } from '../middleware/authMiddleware.js'
import {
	getBookLessonById,
	getBookLessonTranscribeForStudent,
	getBookLessonsBySubjectForStudent,
} from '../controllers/bookLessonsController.js'

const router = express.Router()

router.get(
	'/subject/:subjectId',
	protectStudent,
	getBookLessonsBySubjectForStudent,
)
router.get(
	'/:lessonId/transcribe',
	protectStudent,
	getBookLessonTranscribeForStudent,
)
router.get('/:lessonId', protectStudent, getBookLessonById)

export default router
