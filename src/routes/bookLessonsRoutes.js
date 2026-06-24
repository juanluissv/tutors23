import express from 'express'
import { protectStudent } from '../middleware/authMiddleware.js'
import { getBookLessonById } from '../controllers/bookLessonsController.js'

const router = express.Router()

router.get('/:lessonId', protectStudent, getBookLessonById)

export default router
