import mongoose from 'mongoose'
import OpenAI from 'openai'
import BookLessons from '../models/bookLessonsModel.js'
import Subject from '../models/subjectModel.js'
import { extractBookLessonText } from './extractBookLessonText.js'
import { EMBEDDING_MODEL, getPineconeClient } from './ragConfig.js'

const CHAT_MODEL = 'gpt-4o-mini'
const SIMILARITY_TOP_K = 12
const MAX_CONTEXT_CHARS = 24000
const LESSON_CHUNK_SIZE = 1200
const LESSON_CHUNK_OVERLAP = 200
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

const STOP_WORDS = new Set([
	'que', 'qué', 'cual', 'cuál', 'cuales', 'cuáles',
	'como', 'cómo', 'donde', 'dónde', 'cuando', 'cuándo',
	'quien', 'quién', 'quienes', 'quiénes',
	'es', 'son', 'esta', 'está', 'estan', 'están',
	'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las',
	'de', 'del', 'al', 'en', 'y', 'o', 'u', 'a', 'por',
	'para', 'con', 'sin', 'se', 'su', 'sus', 'mi', 'me',
	'lo', 'le', 'les', 'hay', 'ser', 'fue', 'era',
	'the', 'and', 'or', 'is', 'are', 'was', 'were',
	'what', 'how', 'why', 'when', 'where', 'who',
])

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured')
	}
	return new OpenAI({ apiKey })
}

function sanitizeForLlm (text) {
	return Buffer.from(String(text ?? ''), 'utf8')
		.toString('utf8')
		.replace(/\u0000/g, '')
		.trim()
}

function splitText (text, chunkSize, overlap) {
	const chunks = []
	const step = Math.max(1, chunkSize - overlap)
	let start = 0

	while (start < text.length) {
		chunks.push(text.slice(start, start + chunkSize))
		start += step
	}

	return chunks
}

function normalizeText (text) {
	return String(text ?? '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
}

function extractSearchTerms (question) {
	const words = normalizeText(question).match(/[a-z0-9]{3,}/g) || []
	const terms = new Set()

	for (const word of words) {
		if (STOP_WORDS.has(word)) {
			continue
		}

		terms.add(word)
		if (word.endsWith('es') && word.length > 5) {
			terms.add(word.slice(0, -2))
		} else if (word.endsWith('s') && word.length > 4) {
			terms.add(word.slice(0, -1))
		}
	}

	return [...terms]
}

function scoreChunk (chunk, terms) {
	if (terms.length === 0) {
		return 0
	}

	const lower = normalizeText(chunk)
	let score = 0

	for (const term of terms) {
		if (!lower.includes(term)) {
			continue
		}

		score += 2
		if (
			lower.includes(`${term} es `)
			|| lower.includes(`un ${term} es`)
			|| lower.includes(`una ${term} es`)
			|| lower.includes(`se llama ${term}`)
			|| lower.includes(`${term} es un`)
			|| lower.includes(`${term} es una`)
		) {
			score += 5
		}
	}

	return score
}

function pickRelevantChunks (text, question, maxChars) {
	const trimmed = sanitizeForLlm(text)
	if (!trimmed) {
		return ''
	}
	if (trimmed.length <= maxChars) {
		return trimmed
	}

	const chunks = splitText(trimmed, LESSON_CHUNK_SIZE, LESSON_CHUNK_OVERLAP)
	if (chunks.length === 0) {
		return trimmed.slice(0, maxChars)
	}

	const terms = extractSearchTerms(question)
	const scored = chunks.map((chunk, index) => ({
		chunk,
		index,
		score: scoreChunk(chunk, terms),
	}))

	const chosen = new Set()
	for (let i = 0; i < Math.min(2, chunks.length); i += 1) {
		chosen.add(i)
	}

	const ranked = [...scored]
		.sort((a, b) => b.score - a.score || a.index - b.index)

	const totalChosenSize = () => [...chosen]
		.reduce((sum, index) => sum + chunks[index].length, 0)

	for (const item of ranked) {
		if (item.score <= 0) {
			break
		}

		chosen.add(item.index)
		if (item.index > 0) {
			chosen.add(item.index - 1)
		}
		if (item.index < chunks.length - 1) {
			chosen.add(item.index + 1)
		}
		if (totalChosenSize() >= maxChars) {
			break
		}
	}

	if (chosen.size <= 2) {
		for (let i = 0; i < chunks.length; i += 1) {
			chosen.add(i)
			if (totalChosenSize() >= maxChars) {
				break
			}
		}
	}

	return [...chosen]
		.sort((a, b) => a - b)
		.map((index) => chunks[index])
		.join('\n\n')
		.slice(0, maxChars)
}

function nodeTextFromContent (parsed) {
	if (!parsed || typeof parsed !== 'object') {
		return ''
	}

	if (typeof parsed.text === 'string' && parsed.text.trim()) {
		return parsed.text
	}

	const resource = parsed.text_resource
	if (typeof resource?.text === 'string' && resource.text.trim()) {
		return resource.text
	}
	if (
		typeof resource?.data?.value === 'string'
		&& resource.data.value.trim()
	) {
		return resource.data.value
	}

	return ''
}

function textFromMatch (match) {
	const meta = match?.metadata || {}

	if (typeof meta.chunkText === 'string' && meta.chunkText.trim()) {
		return sanitizeForLlm(meta.chunkText)
	}

	if (typeof meta.text === 'string' && meta.text.trim()) {
		return sanitizeForLlm(meta.text)
	}

	if (typeof meta._node_content === 'string') {
		try {
			const parsed = JSON.parse(meta._node_content)
			const nodeText = nodeTextFromContent(parsed)
			if (nodeText) {
				return sanitizeForLlm(nodeText)
			}
		} catch (err) {
			console.warn(
				'Could not parse Pinecone node content:',
				err?.message || err,
			)
		}
	}

	return ''
}

function parseCombinedIndexName (indexName) {
	const parts = String(indexName ?? '').split('-')
	if (
		parts.length === 2
		&& OBJECT_ID_RE.test(parts[0])
		&& OBJECT_ID_RE.test(parts[1])
	) {
		return {
			subjectId: parts[0],
			chapterId: parts[1],
		}
	}
	return null
}

async function loadLessonPlainText ({ indexName, lessonId }) {
	try {
		if (lessonId && mongoose.Types.ObjectId.isValid(lessonId)) {
			const lesson = await BookLessons.findById(lessonId)
			if (lesson) {
				return extractBookLessonText(lesson)
			}
		}

		const subject = await Subject.findOne({
			'bookChapters.pineconeIndexName': indexName,
		}).select('_id bookChapters')

		if (subject) {
			const chapter = (subject.bookChapters || []).find((item) => (
				String(item.pineconeIndexName || '').trim() === indexName
			))
			if (chapter?._id) {
				const lesson = await BookLessons.findOne({
					subject: subject._id,
					'bookChapter.chapterId': chapter._id,
				})
				if (lesson) {
					return extractBookLessonText(lesson)
				}
			}
		}

		const parsed = parseCombinedIndexName(indexName)
		if (parsed) {
			const lesson = await BookLessons.findOne({
				subject: parsed.subjectId,
				'bookChapter.chapterId': parsed.chapterId,
			})
			if (lesson) {
				return extractBookLessonText(lesson)
			}
		}
	} catch (err) {
		console.warn(
			'Could not load lesson text for tutor:',
			err?.message || err,
		)
	}

	return ''
}

function mergeContexts (primary, secondary, maxChars) {
	const parts = []
	let used = 0

	const push = (text) => {
		const clean = sanitizeForLlm(text)
		if (!clean) {
			return
		}

		const preview = clean.slice(0, 80)
		if (parts.some((part) => part.includes(preview))) {
			return
		}

		const remaining = maxChars - used
		if (remaining <= 0) {
			return
		}
		if (clean.length > remaining) {
			if (remaining < 80) {
				return
			}
			parts.push(clean.slice(0, remaining))
			used += remaining
			return
		}

		parts.push(clean)
		used += clean.length
	}

	push(primary)
	push(secondary)
	return parts.join('\n\n')
}

async function retrievePineconeContext (pineconeIndex, vector) {
	const results = await pineconeIndex.query({
		vector,
		topK: SIMILARITY_TOP_K,
		includeMetadata: true,
	})

	return (results.matches || [])
		.map(textFromMatch)
		.filter(Boolean)
		.join('\n\n')
		.slice(0, MAX_CONTEXT_CHARS)
}

async function queryChapterTutor ({ indexName, question, lessonId }) {
	const resolvedIndexName = String(indexName ?? '').trim()
	const questionTrim = sanitizeForLlm(question)

	if (!resolvedIndexName) {
		throw new Error('Pinecone index id is required')
	}
	if (!questionTrim) {
		throw new Error('Question is required')
	}

	const openai = getOpenAIClient()
	const pineconeIndex = getPineconeClient().index(resolvedIndexName)

	const embeddingRes = await openai.embeddings.create({
		model: EMBEDDING_MODEL,
		input: questionTrim,
	})

	const vector = embeddingRes.data?.[0]?.embedding
	if (!Array.isArray(vector) || vector.length === 0) {
		throw new Error('Failed to embed the question')
	}

	const [pineconeContext, lessonText] = await Promise.all([
		retrievePineconeContext(pineconeIndex, vector),
		loadLessonPlainText({
			indexName: resolvedIndexName,
			lessonId,
		}),
	])

	const lessonContext = pickRelevantChunks(
		lessonText,
		questionTrim,
		MAX_CONTEXT_CHARS,
	)
	const context = mergeContexts(
		lessonContext,
		pineconeContext,
		MAX_CONTEXT_CHARS,
	)

	if (!context) {
		return {
			message: 'No encontré información suficiente en este capítulo '
				+ 'para responder esa pregunta.',
		}
	}

	const completion = await openai.chat.completions.create({
		model: CHAT_MODEL,
		temperature: 0.2,
		messages: [
			{
				role: 'system',
				content: 'Eres un tutor de IA. Responde en español, solo con '
					+ 'la información del material del capítulo. Si el '
					+ 'material incluye una definición, explícala con esas '
					+ 'palabras. Si el material no contiene la respuesta, '
					+ 'dilo claramente.',
			},
			{
				role: 'user',
				content: `Material del capítulo:\n${context}\n\n`
					+ `Pregunta del estudiante:\n${questionTrim}`,
			},
		],
	})

	const message = sanitizeForLlm(
		completion.choices?.[0]?.message?.content,
	)
	if (!message) {
		throw new Error('The tutor returned an empty answer')
	}

	return { message }
}

export { queryChapterTutor }
