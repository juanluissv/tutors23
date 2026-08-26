import asyncHandler from '../middleware/asyncHandler.js'
import {
	getStudentActiveSubscription,
	universitySubscriptionNeedsSubjects,
} from './subscriptionController.js'
import dotenv from 'dotenv'
import { queryChapterTutor } from '../utils/queryChapterTutor.js'

dotenv.config()

// POST /api/chat
const getChat = asyncHandler(async (req, res) => {
	const { question, id } = req.body

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

	try {
		const { message } = await queryChapterTutor({
			indexName,
			question: questionTrim,
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
