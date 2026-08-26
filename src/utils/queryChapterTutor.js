import OpenAI from 'openai'
import { EMBEDDING_MODEL, getPineconeClient } from './ragConfig.js'

const CHAT_MODEL = 'gpt-4o-mini'
const SIMILARITY_TOP_K = 5
const MAX_CONTEXT_CHARS = 12000

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

function textFromMatch (match) {
	const meta = match?.metadata || {}

	if (typeof meta.text === 'string' && meta.text.trim()) {
		return sanitizeForLlm(meta.text)
	}

	if (typeof meta._node_content === 'string') {
		try {
			const parsed = JSON.parse(meta._node_content)
			if (typeof parsed?.text === 'string') {
				return sanitizeForLlm(parsed.text)
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

async function queryChapterTutor ({ indexName, question }) {
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
	

	const results = await pineconeIndex.query({
		vector,
		topK: SIMILARITY_TOP_K,
		includeMetadata: true,
	})

	

	const context = (results.matches || [])
		.map(textFromMatch)
		.filter(Boolean)
		.join('\n\n')
		.slice(0, MAX_CONTEXT_CHARS)

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
					+ 'material no contiene la respuesta, dilo claramente.',
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
