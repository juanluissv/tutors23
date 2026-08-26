const CREATOMATE_API_BASE = 'https://api.creatomate.com/v2'

const DEFAULT_POLL_MS = 5000
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000

function getCreatomateApiKey () {
	const apiKey = process.env.CREATOMATE_API_KEY
	if (!apiKey || String(apiKey).trim() === '') {
		throw new Error('CREATOMATE_API_KEY is not configured')
	}
	return String(apiKey).trim()
}

function readPollMs () {
	const raw = process.env.CREATOMATE_RENDER_POLL_MS
	if (!raw) {
		return DEFAULT_POLL_MS
	}
	const n = parseInt(raw, 10)
	return !Number.isNaN(n) && n >= 1000 ? n : DEFAULT_POLL_MS
}

function readTimeoutMs () {
	const raw = process.env.CREATOMATE_RENDER_TIMEOUT_MS
	if (!raw) {
		return DEFAULT_TIMEOUT_MS
	}
	const n = parseInt(raw, 10)
	return !Number.isNaN(n) && n >= 60000 ? n : DEFAULT_TIMEOUT_MS
}

function sleep (ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

async function creatomateFetch (path, options = {}) {
	const apiKey = getCreatomateApiKey()
	const url = `${CREATOMATE_API_BASE}${path}`
	const response = await fetch(url, {
		...options,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	})

	const text = await response.text()
	let body = null
	if (text) {
		try {
			body = JSON.parse(text)
		} catch {
			body = { message: text }
		}
	}

	if (!response.ok) {
		const message = body?.message
			|| body?.error
			|| `Creatomate API error (${response.status})`
		const err = new Error(message)
		err.statusCode = response.status
		err.body = body
		throw err
	}

	return body
}

function normalizeRenderRecord (payload) {
	if (Array.isArray(payload)) {
		return payload[0] || null
	}
	return payload || null
}

function assertVideoRenderRecord (record, context = 'Creatomate render') {
	if (!record?.id) {
		throw new Error(`${context} did not return a render id`)
	}

	const outputFormat = String(record.output_format ?? '')
		.trim()
		.toLowerCase()
	const url = String(record.url ?? '').trim()
	const isImageFormat = ['jpg', 'jpeg', 'png', 'gif', 'webp']
		.includes(outputFormat)
	const looksLikeImageUrl = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)

	if (isImageFormat || looksLikeImageUrl) {
		const err = new Error(
			`${context} returned an image (${outputFormat || 'unknown'}), `
			+ 'not an mp4 video. The RenderScript was likely submitted '
			+ 'incorrectly — regenerate the Creatomate video.',
		)
		err.statusCode = 422
		err.body = record
		throw err
	}

	return record
}

async function startRenderFromSource (source) {
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		throw new Error('Creatomate RenderScript source must be an object')
	}
	if (String(source.output_format ?? '').toLowerCase() !== 'mp4') {
		throw new Error('Creatomate RenderScript must set output_format to mp4')
	}
	if (!Array.isArray(source.elements) || source.elements.length === 0) {
		throw new Error('Creatomate RenderScript has no elements to render')
	}

	// Creatomate expects RenderScript fields at the top level of the body
	// (not nested under "source"). See:
	// https://creatomate.com/docs/api/quick-start/create-a-video-by-render-script
	const payload = await creatomateFetch('/renders', {
		method: 'POST',
		body: JSON.stringify(source),
	})
	const record = normalizeRenderRecord(payload)
	return assertVideoRenderRecord(record, 'Creatomate start render')
}

async function getRenderStatus (renderId) {
	const payload = await creatomateFetch(
		`/renders/${encodeURIComponent(renderId)}`,
		{ method: 'GET' },
	)
	return normalizeRenderRecord(payload)
}

async function waitForRender (renderId, options = {}) {
	const pollMs = options.pollMs ?? readPollMs()
	const timeoutMs = options.timeoutMs ?? readTimeoutMs()
	const started = Date.now()

	while (Date.now() - started < timeoutMs) {
		const record = await getRenderStatus(renderId)
		const status = String(record?.status ?? '').toLowerCase()

		if (status === 'succeeded') {
			return record
		}

		if (status === 'failed') {
			const message = record?.error_message
				|| record?.message
				|| 'Creatomate render failed'
			throw new Error(message)
		}

		await sleep(pollMs)
	}

	throw new Error(
		'Creatomate render timed out. Try again or increase '
		+ 'CREATOMATE_RENDER_TIMEOUT_MS.',
	)
}

async function downloadRenderVideo (url) {
	const videoUrl = String(url ?? '').trim()
	if (!videoUrl) {
		throw new Error('Creatomate render has no download URL')
	}

	if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(videoUrl)) {
		throw new Error(
			'Creatomate download URL is an image, not a video. '
			+ 'Regenerate the Creatomate video.',
		)
	}

	const response = await fetch(videoUrl)
	if (!response.ok) {
		throw new Error(
			`Failed to download rendered video (${response.status})`,
		)
	}

	const contentType = String(
		response.headers.get('content-type') ?? '',
	).toLowerCase()
	if (contentType.startsWith('image/')) {
		throw new Error(
			'Creatomate returned an image file instead of a video. '
			+ 'Regenerate the Creatomate video.',
		)
	}

	const arrayBuffer = await response.arrayBuffer()
	return Buffer.from(arrayBuffer)
}

async function renderCreatomateVideo (source, options = {}) {
	const started = await startRenderFromSource(source)
	const finished = await waitForRender(started.id, options)
	const buffer = await downloadRenderVideo(finished.url)
	return {
		renderId: finished.id,
		url: finished.url,
		buffer,
		duration: finished.duration,
	}
}

export {
	startRenderFromSource,
	getRenderStatus,
	waitForRender,
	downloadRenderVideo,
	renderCreatomateVideo,
	assertVideoRenderRecord,
}
