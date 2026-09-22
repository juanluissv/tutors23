import mongoose from 'mongoose'
import asyncHandler from '../middleware/asyncHandler.js'
import BookLessons from '../models/bookLessonsModel.js'
import Subject from '../models/subjectModel.js'
import {
	getStudentActiveSubscription,
	universitySubscriptionNeedsSubjects,
} from './subscriptionController.js'
import dotenv from 'dotenv'
import { queryChapterTutor } from '../utils/queryChapterTutor.js'

dotenv.config()

async function resolveAccessibleLessonId (studentId, lessonId) {
	if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
		return undefined
	}

	const lesson = await BookLessons.findById(lessonId).select('subject')
	if (!lesson?.subject) {
		return undefined
	}

	const subject = await Subject.findById(lesson.subject).select('students')
	const isEnrolled = (subject?.students || []).some(
		(id) => String(id) === String(studentId),
	)
	if (!isEnrolled) {
		return null
	}

	return String(lesson._id)
}

// POST /api/chat
const getChat = asyncHandler(async (req, res) => {
	const { question, id, lessonId } = req.body

	const questionTrim = String(question ?? '').trim()
	if (!questionTrim) {
		res.status(400)
		throw new Error('Question is required')
	}

	const subscription = await getStudentActiveSubscription(req.student._id)
	if (!subscription) {
		res.status(403)
		throw new Error(
			'An active subscription is required to use the AI tutor',
		)
	}
	if (universitySubscriptionNeedsSubjects(subscription)) {
		res.status(403)
		throw new Error(
			'Choose your subjects for this semester before using the AI tutor',
		)
	}

	const indexName = String(id ?? '').trim()
	if (!indexName) {
		res.status(400)
		throw new Error('Pinecone index id is required')
	}

	const resolvedLessonId = await resolveAccessibleLessonId(
		req.student._id,
		String(lessonId ?? '').trim(),
	)
	if (resolvedLessonId === null) {
		res.status(403)
		throw new Error('Not authorized to use this chapter tutor')
	}

	try {
		const { message } = await queryChapterTutor({
			indexName,
			question: questionTrim,
			lessonId: resolvedLessonId,
		})
		res.json({ message })
	} catch (err) {
		console.error('Chat RAG error:', err)
		res.status(502)
		throw new Error(
			'No se pudo responder la pregunta con el material del capítulo.',
		)
	}
})

export { getChat }
