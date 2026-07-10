/**
 * Convert SubRip (.srt) caption text to WebVTT (.vtt).
 * Timestamps use comma milliseconds in SRT and dot milliseconds in VTT.
 */

const SRT_TIMESTAMP_RE = /(\d{2}:\d{2}:\d{2}),(\d{3})/g

function normalizeSrtInput (input) {
	if (input == null) {
		return ''
	}
	const text = Buffer.isBuffer(input)
		? input.toString('utf8')
		: String(input)
	return text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
}

function srtTimestampsToVtt (body) {
	return body.replace(SRT_TIMESTAMP_RE, '$1.$2')
}

/**
 * @param {string|Buffer} srtContent
 * @returns {string} WebVTT document
 */
function convertSrtToVtt (srtContent) {
	const normalized = normalizeSrtInput(srtContent)
	if (!normalized) {
		throw new Error('The subtitle file is empty.')
	}

	if (/^WEBVTT/i.test(normalized)) {
		return `${normalized}\n`
	}

	const vttBody = srtTimestampsToVtt(normalized)
	return `WEBVTT\n\n${vttBody}\n`
}

export {
	convertSrtToVtt,
	normalizeSrtInput,
	srtTimestampsToVtt,
}
