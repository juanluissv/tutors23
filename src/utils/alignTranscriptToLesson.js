import { extractBlockText } from './extractBookLessonText.js'
import {
	assignBlockIds,
	isBlockId,
	HERO_BLOCK_IDS,
} from './lessonBlockIds.js'

const ACTIVITY_LABELS = {
	individual: 'Actividad individual',
	'en pares': 'Actividad en pares',
	'en equipo': 'Actividad en equipo',
	'con docente': 'Actividad con docente',
}

const ACTIVITY_LABELS_NORM = Object.fromEntries(
	Object.entries(ACTIVITY_LABELS).map(([kind, label]) => [
		kind,
		normalizeForMatch(label),
	]),
)

const MATCH_STOP_WORDS = new Set([
	'de', 'la', 'el', 'en', 'los', 'las', 'un', 'una', 'unos', 'unas',
	'que', 'por', 'con', 'del', 'sus', 'como', 'para', 'mas', 'muy',
	'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'sobre', 'entre',
])

const ALIGN_WINDOW = 18
const MIN_OVERLAP_SCORE = 0.45

function normalizeForMatch (text) {
	return String(text || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function tokenizeForMatch (text) {
	return normalizeForMatch(text)
		.split(' ')
		.filter((word) => word.length > 2 && !MATCH_STOP_WORDS.has(word))
}

function getStructuralLabel (block) {
	const type = block?.type || 'p'
	const meta = block?.meta || {}

	if (type === 'activity') {
		const kind = meta.activityKind || ''
		return ACTIVITY_LABELS_NORM[kind] || normalizeForMatch('Actividad')
	}

	if (type === 'phase') {
		return normalizeForMatch(block.text)
	}

	if (type === 'info') {
		return normalizeForMatch(block.text)
	}

	if (type === 'table') {
		return normalizeForMatch(block.text)
	}

	return ''
}

function buildHeroSegments (lessonMeta = {}) {
	const fields = [
		{ key: 'mainTitle', blockId: HERO_BLOCK_IDS.mainTitle },
		{ key: 'unitTheme', blockId: HERO_BLOCK_IDS.unitTheme },
		{ key: 'heroSubtitle', blockId: HERO_BLOCK_IDS.heroSubtitle },
		{ key: 'objectivesText', blockId: HERO_BLOCK_IDS.objectivesText },
	]

	const segments = []

	for (const field of fields) {
		const text = String(lessonMeta[field.key] || '').trim()
		if (!text) {
			continue
		}

		segments.push({
			index: segments.length,
			blockId: field.blockId,
			type: 'hero',
			activityKind: '',
			text,
			normText: normalizeForMatch(text),
			structuralLabel: '',
			headingNorm: '',
		})
	}

	return segments
}

function buildContentSegments (content) {
	const blocks = assignBlockIds(content)

	return blocks.map((block, index) => {
		const lines = extractBlockText(block)
		const text = lines.join(' ')

		return {
			index,
			blockId: block.blockId,
			type: block.type || 'p',
			activityKind: block.meta?.activityKind || '',
			text,
			normText: normalizeForMatch(text),
			structuralLabel: getStructuralLabel(block),
			headingNorm: ['h2', 'h3', 'h4', 'h5', 'eyebrow'].includes(block.type)
				? normalizeForMatch(block.text)
				: '',
		}
	})
}

function buildAnchorSegments (content, lessonMeta = {}) {
	const heroSegments = buildHeroSegments(lessonMeta)
	const contentSegments = buildContentSegments(content)

	return [...heroSegments, ...contentSegments].map((seg, index) => ({
		...seg,
		index,
	}))
}

function scoreOverlap (normCue, normBlockText) {
	const cueTokens = tokenizeForMatch(normCue)
	if (cueTokens.length === 0 || !normBlockText) {
		return 0
	}

	const blockTokens = new Set(tokenizeForMatch(normBlockText))
	let hits = 0

	for (const token of cueTokens) {
		if (blockTokens.has(token)) {
			hits += 1
		}
	}

	return hits / cueTokens.length
}

function activitySpeaksLabel (seg, normCue) {
	if (seg.type !== 'activity') {
		return false
	}

	const textNorm = normalizeForMatch(seg.text)
	return textNorm === normCue
}

function findActivityLabelSegment (segments, fromIdx, normCue) {
	for (let i = fromIdx; i < segments.length; i += 1) {
		if (activitySpeaksLabel(segments[i], normCue)) {
			return i
		}
	}

	for (const [kind, label] of Object.entries(ACTIVITY_LABELS_NORM)) {
		if (normCue !== label) {
			continue
		}

		for (let i = fromIdx; i < segments.length; i += 1) {
			const seg = segments[i]
			if (seg.type !== 'activity' || seg.activityKind !== kind) {
				continue
			}
			if (!seg.text || normalizeForMatch(seg.text).length <= 40) {
				return i
			}
		}
	}

	return -1
}

function findTableCaptionSegment (segments, fromIdx, normCue) {
	if (normCue.length > 60) {
		return -1
	}

	for (let i = fromIdx; i < segments.length; i += 1) {
		const seg = segments[i]
		if (seg.type !== 'table') {
			continue
		}
		const caption = normalizeForMatch(seg.text)
		if (caption && (caption === normCue || caption.includes(normCue))) {
			return i
		}
	}

	return -1
}

function findStructuralSegment (segments, fromIdx, normCue) {
	const tableIdx = findTableCaptionSegment(segments, fromIdx, normCue)
	if (tableIdx >= 0) {
		return tableIdx
	}

	for (const label of Object.values(ACTIVITY_LABELS_NORM)) {
		if (normCue === label) {
			const activityIdx = findActivityLabelSegment(
				segments,
				fromIdx,
				normCue,
			)
			if (activityIdx >= 0) {
				return activityIdx
			}
		}
	}

	for (let i = fromIdx; i < segments.length; i += 1) {
		const seg = segments[i]
		if (seg.type !== 'phase' && seg.type !== 'info') {
			continue
		}
		const label = seg.structuralLabel
		if (!label) {
			continue
		}
		if (
			normCue === label
			|| normCue.includes(label)
			|| label.includes(normCue)
		) {
			return i
		}
	}

	if (normCue.length <= 80) {
		for (let i = fromIdx; i < segments.length; i += 1) {
			const heading = segments[i].headingNorm
			if (!heading) {
				continue
			}
			if (
				heading === normCue
				|| heading.startsWith(normCue)
				|| normCue.startsWith(heading)
			) {
				return i
			}
		}
	}

	return -1
}

function bestMatchInWindow (segments, fromIdx, normCue) {
	let bestIndex = -1
	let bestScore = 0
	const end = Math.min(segments.length, fromIdx + ALIGN_WINDOW)

	for (let i = fromIdx; i < end; i += 1) {
		const score = scoreOverlap(normCue, segments[i].normText)
		if (score > bestScore) {
			bestScore = score
			bestIndex = i
		}
	}

	if (bestIndex < 0 || bestScore < MIN_OVERLAP_SCORE) {
		return -1
	}

	return bestIndex
}

function matchHeroSegment (segments, fromIdx, normCue) {
	for (let i = fromIdx; i < segments.length; i += 1) {
		const seg = segments[i]
		if (seg.type !== 'hero') {
			break
		}
		if (seg.normText === normCue) {
			return i
		}
		if (
			seg.normText.includes(normCue)
			|| normCue.includes(seg.normText)
		) {
			return i
		}
	}

	for (let i = 0; i < segments.length; i += 1) {
		const seg = segments[i]
		if (seg.type !== 'hero') {
			continue
		}
		if (seg.normText === normCue) {
			return i
		}
		const score = scoreOverlap(normCue, seg.normText)
		if (score >= 0.85) {
			return i
		}
	}

	return -1
}

function resolveLessonMeta (lessonOrContent) {
	if (Array.isArray(lessonOrContent)) {
		return { content: lessonOrContent, meta: {} }
	}

	if (!lessonOrContent || typeof lessonOrContent !== 'object') {
		return { content: [], meta: {} }
	}

	return {
		content: Array.isArray(lessonOrContent.content)
			? lessonOrContent.content
			: [],
		meta: {
			mainTitle: lessonOrContent.mainTitle || '',
			unitTheme: lessonOrContent.unitTheme || '',
			heroSubtitle: lessonOrContent.heroSubtitle || '',
			objectivesText: lessonOrContent.objectivesText || '',
		},
	}
}

function alignCuesToBlocks (cues, lessonOrContent) {
	const { content, meta } = resolveLessonMeta(lessonOrContent)
	const segments = buildAnchorSegments(content, meta)

	if (segments.length === 0) {
		return cues.map((cue) => ({ ...cue, blockId: '' }))
	}

	let segIdx = 0

	return cues.map((cue) => {
		const normCue = normalizeForMatch(cue.text)
		if (!normCue) {
			return { ...cue, blockId: segments[segIdx]?.blockId || '' }
		}

		const heroIdx = matchHeroSegment(segments, segIdx, normCue)
		if (heroIdx >= 0) {
			segIdx = heroIdx
			return {
				...cue,
				blockId: segments[heroIdx].blockId,
			}
		}

		const structuralIdx = findStructuralSegment(
			segments,
			segIdx,
			normCue,
		)

		if (structuralIdx >= 0) {
			segIdx = structuralIdx
			return {
				...cue,
				blockId: segments[structuralIdx].blockId,
			}
		}

		const contentIdx = bestMatchInWindow(segments, segIdx, normCue)
		if (contentIdx >= 0) {
			segIdx = contentIdx
			return {
				...cue,
				blockId: segments[contentIdx].blockId,
			}
		}

		return {
			...cue,
			blockId: segments[segIdx]?.blockId || '',
		}
	})
}

function parseVttTime (timeString) {
	const parts = String(timeString || '').trim().split(':')
	if (parts.length !== 3) {
		return 0
	}

	const hours = parseFloat(parts[0])
	const minutes = parseFloat(parts[1])
	const seconds = parseFloat(parts[2])
	return hours * 3600 + minutes * 60 + seconds
}

function formatVttTime (seconds) {
	const safe = Math.max(0, Number(seconds) || 0)
	const hours = Math.floor(safe / 3600)
	const minutes = Math.floor((safe % 3600) / 60)
	const secs = safe % 60
	const wholeSecs = Math.floor(secs)
	const millis = Math.round((secs - wholeSecs) * 1000)

	return [
		String(hours).padStart(2, '0'),
		String(minutes).padStart(2, '0'),
		`${String(wholeSecs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`,
	].join(':')
}

function parseVttContent (vttText) {
	const lines = String(vttText || '').replace(/^\uFEFF/, '').split('\n')
	const cues = []
	let i = 0

	while (i < lines.length) {
		const line = lines[i].trim()

		if (
			line === ''
			|| line === 'WEBVTT'
			|| /^NOTE\b/i.test(line)
		) {
			i += 1
			continue
		}

		let blockId = ''
		let timestampLine = line

		if (!line.includes('-->')) {
			if (isBlockId(line)) {
				blockId = line
				i += 1
				if (i >= lines.length) {
					break
				}
				timestampLine = lines[i].trim()
			} else if (/^\d+$/.test(line)) {
				i += 1
				if (i >= lines.length) {
					break
				}
				timestampLine = lines[i].trim()
			}
		}

		if (!timestampLine.includes('-->')) {
			i += 1
			continue
		}

		const [startTime, endTime] = timestampLine.split('-->')
			.map((part) => part.trim())
		const start = parseVttTime(startTime)
		const end = parseVttTime(endTime)

		i += 1
		const textLines = []
		while (
			i < lines.length
			&& lines[i].trim() !== ''
			&& !lines[i].includes('-->')
		) {
			const next = lines[i].trim()
			if (!isBlockId(next) && !/^\d+$/.test(next)) {
				textLines.push(next)
			}
			i += 1
		}

		cues.push({
			start,
			end,
			text: textLines.join(' ').trim(),
			blockId,
		})
	}

	return cues
}

function formatVttDocument (cues) {
	const body = cues.map((cue) => {
		const parts = []
		if (cue.blockId) {
			parts.push(cue.blockId)
		}
		parts.push(
			`${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}`,
			cue.text,
			'',
		)
		return parts.join('\n')
	}).join('\n')

	return `WEBVTT\n\n${body}`.trim() + '\n'
}

function annotateVttWithBlockIds (vttContent, lessonOrContent) {
	const cues = parseVttContent(vttContent)
	if (cues.length === 0) {
		return vttContent
	}

	const aligned = alignCuesToBlocks(cues, lessonOrContent)
	return formatVttDocument(aligned)
}

export {
	alignCuesToBlocks,
	annotateVttWithBlockIds,
	buildAnchorSegments,
	formatVttDocument,
	parseVttContent,
	normalizeForMatch,
	HERO_BLOCK_IDS,
}
