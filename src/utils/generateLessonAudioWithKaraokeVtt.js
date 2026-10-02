import { assignBlockIds } from './lessonBlockIds.js'
import {
	buildAnchorSegments,
	formatVttDocument,
} from './alignTranscriptToLesson.js'
import {
	concatMp3Buffers,
	DEFAULT_INSTRUCTIONS,
	DEFAULT_VOICE,
	getOpenAIClient,
	probeMp3DurationSeconds,
	splitTextForTts,
	synthesizeChunk,
} from './generateVideoTts.js'

function lessonMetaFromLesson (lesson) {
	return {
		mainTitle: lesson?.mainTitle || '',
		unitTheme: lesson?.unitTheme || '',
		heroSubtitle: lesson?.heroSubtitle || '',
		objectivesText: lesson?.objectivesText || '',
	}
}

/**
 * Synthesize lesson narration per anchor segment, measure each clip, and
 * build a WebVTT with blockId on every cue for karaoke read-along.
 */
async function generateLessonAudioWithKaraokeVtt (lesson, options = {}) {
	const content = assignBlockIds(
		Array.isArray(lesson?.content) ? lesson.content : [],
	)
	const segments = buildAnchorSegments(content, lessonMetaFromLesson(lesson))
	const narratable = segments.filter(
		(seg) => String(seg.text || '').trim() !== '',
	)

	if (narratable.length === 0) {
		throw new Error('The web lesson has no narratable text.')
	}

	const voice = options.voice || DEFAULT_VOICE
	const instructions = options.instructions || DEFAULT_INSTRUCTIONS
	const client = getOpenAIClient()

	const cues = []
	const buffers = []
	let cursor = 0

	for (const segment of narratable) {
		const chunks = splitTextForTts(segment.text)
		for (const chunk of chunks) {
			const buffer = await synthesizeChunk(
				client,
				chunk,
				voice,
				instructions,
			)
			const durationSeconds = await probeMp3DurationSeconds(buffer)
			const start = cursor
			const end = cursor + durationSeconds

			cues.push({
				start,
				end,
				text: chunk.trim(),
				blockId: segment.blockId,
			})
			buffers.push(buffer)
			cursor = end
		}
	}

	const audioBuffer = await concatMp3Buffers(buffers)
	const vttContent = formatVttDocument(cues)
	const audioDurationSeconds = Math.round(cursor * 100) / 100

	return {
		audioBuffer,
		vttContent,
		audioDurationSeconds,
		cueCount: cues.length,
	}
}

export {
	generateLessonAudioWithKaraokeVtt,
}
