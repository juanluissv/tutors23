import OpenAI from 'openai'
import { splitText } from './ingestion.js'
import { extractBookLessonText } from './extractBookLessonText.js'

const TARGET_QUESTION_COUNT = 10
const MAP_CONCURRENCY = 3
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 150
const MAX_REDUCE_CHARS = 48000
const SINGLE_PASS_MAX_CHARS = 6000

const MAP_SYSTEM_PROMPT = `Eres un profesor experto. Del fragmento de lección que recibes,
genera entre 2 y 3 preguntas de comprensión con respuestas cortas.

Reglas:
- Usa SOLO información del fragmento
- No repitas actividades del libro (Exploración, Actividad en pares, etc.)
- Enfócate en conceptos, datos, causas y efectos
- Responde en español
- Devuelve JSON: { "questions": [{ "question": "...", "answer": "..." }] }`

const REDUCE_SYSTEM_PROMPT = `Eres un profesor experto. Combina listas parciales de preguntas
en EXACTAMENTE 10 preguntas finales para toda la lección.

Reglas:
- Elimina duplicados y preguntas muy similares
- Cubre conceptos clave, datos, regiones, causas e impactos
- Mezcla preguntas factuales y de análisis
- Respuestas breves (1–3 oraciones), solo con info del texto
- No incluyas preguntas de actividades del libro
- Devuelve JSON: { "questions": [{ "question": "...", "answer": "..." }] }
- El array "questions" debe tener exactamente 10 elementos`

const SINGLE_PASS_SYSTEM_PROMPT = `Eres un profesor experto. A partir del texto completo de la
lección, genera EXACTAMENTE 10 preguntas de comprensión con respuestas cortas.

Reglas:
- Usa SOLO información del texto
- No repitas actividades del libro (Exploración, Actividad en pares, etc.)
- Cubre conceptos clave, datos, regiones, causas e impactos
- Mezcla preguntas factuales y de análisis
- Respuestas breves (1–3 oraciones)
- Responde en español
- Devuelve JSON: { "questions": [{ "question": "...", "answer": "..." }] }
- El array "questions" debe tener exactamente 10 elementos`

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured')
	}
	return new OpenAI({ apiKey })
}

function normalizeQuestions (parsed) {
	const list = Array.isArray(parsed?.questions)
		? parsed.questions
		: Array.isArray(parsed)
			? parsed
			: []

	return list
		.map((item) => ({
			question: String(item?.question ?? '').trim(),
			answer: String(item?.answer ?? '').trim(),
		}))
		.filter((item) => item.question && item.answer)
}

function dedupeQuestions (questions) {
	const seen = new Set()
	const result = []

	for (const item of questions) {
		const key = item.question.toLowerCase()
		if (seen.has(key)) {
			continue
		}
		seen.add(key)
		result.push(item)
	}

	return result
}

async function callJsonLlm (client, systemPrompt, userPrompt) {
	const response = await client.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0.3,
		response_format: { type: 'json_object' },
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
	})

	const raw = response.choices[0]?.message?.content || '{}'
	return JSON.parse(raw)
}

async function runWithConcurrency (items, worker, concurrency) {
	const results = []

	for (let i = 0; i < items.length; i += concurrency) {
		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(
			batch.map((item, batchIndex) => worker(item, i + batchIndex)),
		)
		results.push(...batchResults)
	}

	return results
}

function formatQuestionsForReduce (questions) {
	return questions
		.map((item, index) => (
			`${index + 1}. P: ${item.question}\nR: ${item.answer}`
		))
		.join('\n\n')
}

async function mapChunk (client, chunk, index, total) {
	const userPrompt = `Fragmento ${index + 1} de ${total}:\n\n${chunk}`
	const parsed = await callJsonLlm(client, MAP_SYSTEM_PROMPT, userPrompt)
	return normalizeQuestions(parsed)
}

async function collapseQuestionLists (client, questions) {
	const formatted = formatQuestionsForReduce(questions)
	if (formatted.length <= MAX_REDUCE_CHARS) {
		return questions
	}

	const midpoint = Math.ceil(questions.length / 2)
	const firstHalf = questions.slice(0, midpoint)
	const secondHalf = questions.slice(midpoint)

	const collapsed = await Promise.all([
		collapseQuestionLists(client, firstHalf),
		collapseQuestionLists(client, secondHalf),
	])

	return collapsed.flat()
}

async function reduceQuestions (client, partialQuestions) {
	const formatted = formatQuestionsForReduce(partialQuestions)
	const userPrompt = `Listas parciales de preguntas:\n\n${formatted}`
	const parsed = await callJsonLlm(client, REDUCE_SYSTEM_PROMPT, userPrompt)
	return normalizeQuestions(parsed)
}

async function generateFromSinglePass (client, text) {
	const userPrompt = `Texto de la lección:\n\n${text}`
	const parsed = await callJsonLlm(
		client,
		SINGLE_PASS_SYSTEM_PROMPT,
		userPrompt,
	)
	return dedupeQuestions(normalizeQuestions(parsed))
}

async function generateFromMapReduce (client, text) {
	const chunks = splitText(text, CHUNK_SIZE, CHUNK_OVERLAP)
	const partialLists = await runWithConcurrency(
		chunks,
		(chunk, index) => mapChunk(client, chunk, index, chunks.length),
		MAP_CONCURRENCY,
	)

	let partialQuestions = dedupeQuestions(partialLists.flat())
	if (partialQuestions.length === 0) {
		throw new Error('Could not extract questions from lesson chunks')
	}

	partialQuestions = await collapseQuestionLists(client, partialQuestions)
	const finalQuestions = await reduceQuestions(client, partialQuestions)
	return dedupeQuestions(finalQuestions)
}

async function generateSuggestedQuestions (lesson) {
	const text = extractBookLessonText(lesson).trim()
	if (text.length < 20) {
		throw new Error('Not enough lesson text to generate questions')
	}

	const client = getOpenAIClient()
	let questions = text.length <= SINGLE_PASS_MAX_CHARS
		? await generateFromSinglePass(client, text)
		: await generateFromMapReduce(client, text)

	if (questions.length < TARGET_QUESTION_COUNT) {
		const retryParsed = await callJsonLlm(
			client,
			REDUCE_SYSTEM_PROMPT,
			`Preguntas disponibles (${questions.length}). Completa hasta 10:\n\n${
				formatQuestionsForReduce(questions)
			}`,
		)
		questions = dedupeQuestions([
			...questions,
			...normalizeQuestions(retryParsed),
		])
	}

	return questions.slice(0, TARGET_QUESTION_COUNT)
}

export {
	TARGET_QUESTION_COUNT,
	generateSuggestedQuestions,
}
