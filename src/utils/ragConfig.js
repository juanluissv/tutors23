import crypto from 'node:crypto'
import { Settings } from 'llamaindex'
import { PineconeVectorStore } from '@llamaindex/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbedding } from '@llamaindex/openai'

const EMBEDDING_MODEL = 'text-embedding-ada-002'
const EMBEDDING_DIMENSION = 1536
const MAX_PINECONE_INDEX_NAME_LENGTH = 45

function getPineconeClient () {
	const apiKey = process.env.PINECONE_API_KEY
	if (!apiKey) {
		throw new Error('PINECONE_API_KEY is not configured')
	}
	return new Pinecone({ apiKey })
}

function configureRagSettings () {
	Settings.embedModel = new OpenAIEmbedding({
		model: EMBEDDING_MODEL,
		apiKey: process.env.OPENAI_API_KEY,
	})
}

function buildChapterPineconeIndexName (subjectId, chapterId) {
	const combined = `${String(subjectId)}-${String(chapterId)}`.toLowerCase()
	if (combined.length <= MAX_PINECONE_INDEX_NAME_LENGTH) {
		return combined
	}

	// Two Mongo ObjectIds are 49 chars; Pinecone names max out at 45.
	const digest = crypto
		.createHash('sha256')
		.update(combined)
		.digest('hex')
		.slice(0, 32)

	return `ch-${digest}`
}

async function ensurePineconeIndex (indexName) {
	const trimmed = String(indexName ?? '').trim()
	if (!trimmed) {
		throw new Error('indexName is required')
	}

	const pc = getPineconeClient()
	const cloud = process.env.PINECONE_CLOUD || 'aws'
	const region = process.env.PINECONE_REGION || 'us-east-1'

	await pc.createIndex({
		name: trimmed,
		dimension: EMBEDDING_DIMENSION,
		metric: 'cosine',
		spec: {
			serverless: {
				cloud,
				region,
			},
		},
		waitUntilReady: true,
		suppressConflicts: true,
	})

	return trimmed
}

function createPineconeVectorStore (indexName) {
	const trimmed = String(indexName ?? '').trim()
	if (!trimmed) {
		throw new Error('indexName is required')
	}

	const pc = getPineconeClient()
	const pineconeIndex = pc.index(trimmed)

	return new PineconeVectorStore({
		pineconeIndex,
		indexName: trimmed,
	})
}

export {
	EMBEDDING_MODEL,
	EMBEDDING_DIMENSION,
	buildChapterPineconeIndexName,
	configureRagSettings,
	createPineconeVectorStore,
	ensurePineconeIndex,
	getPineconeClient,
}
