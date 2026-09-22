import crypto from 'node:crypto'
import {
	Document,
	VectorStoreIndex,
	storageContextFromDefaults,
} from 'llamaindex'
import {
	configureRagSettings,
	createPineconeVectorStore,
} from './ragConfig.js'

function splitText (text, chunkSize = 1000, overlap = 0) {
	const chunks = []
	let start = 0

	while (start < text.length) {
		const end = Math.min(start + chunkSize, text.length)
		chunks.push(text.slice(start, end))
		start += chunkSize - overlap
	}

	return chunks
}

async function ingestTextToPinecone ({
	text,
	indexName,
	metadata = {},
}) {
	const trimmed = String(text ?? '').trim()
	if (trimmed.length < 20) {
		throw new Error('Not enough text to ingest')
	}

	const resolvedIndexName = String(indexName ?? '').trim()
	if (!resolvedIndexName) {
		throw new Error('indexName is required')
	}

	configureRagSettings()

	const vectorStore = createPineconeVectorStore(resolvedIndexName)

	try {
		await vectorStore.clearIndex()
	} catch (clearErr) {
		console.warn(
			'Could not clear Pinecone index before ingest:',
			clearErr?.message || clearErr,
		)
	}

	const storageContext = await storageContextFromDefaults({
		vectorStore,
	})

	const chunks = splitText(trimmed, 1000, 200)
	const documents = chunks.map((chunk, i) => new Document({
		text: chunk,
		id_: `${resolvedIndexName}-chunk-${i}-${crypto.randomBytes(4).toString('hex')}`,
		metadata: {
			...metadata,
			chunkIndex: i,
			chunkText: chunk,
			source: metadata.source ?? resolvedIndexName,
		},
	}))

	await VectorStoreIndex.fromDocuments(documents, { storageContext })

	return {
		indexName: resolvedIndexName,
		chunkCount: documents.length,
	}
}

export {
	ingestTextToPinecone,
	splitText,
}
