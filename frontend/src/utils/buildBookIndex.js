const DEFAULT_LABELS = {
	chapterFallback: (n) => `Chapter ${n}`,
	pagesRange: (start, end) => `Pages ${start}–${end}`,
	fromPage: (start) => `From page ${start}`,
	throughPage: (end) => `Through page ${end}`,
	otherChapters: 'Other chapters',
	unitFallback: (n) => `Unidad ${n}`,
}

function chapterTitle (chapter, index, labels = DEFAULT_LABELS) {
	const title = chapter?.ChapterTitle
		? String(chapter.ChapterTitle).trim()
		: ''
	if (title) {
		return title
	}
	return labels.chapterFallback(
		chapter?.ChapterNumber ?? index + 1,
	)
}

function chapterPageLabel (chapter, labels = DEFAULT_LABELS) {
	const start = chapter?.ChapterBeginPage
	const end = chapter?.ChapterEndPage
	if (start != null && end != null) {
		return labels.pagesRange(start, end)
	}
	if (start != null) {
		return labels.fromPage(start)
	}
	if (end != null) {
		return labels.throughPage(end)
	}
	return ''
}

function parseUnitNumber (text) {
	const match = String(text || '').match(/unidad\s*(\d+)/i)
	return match ? Number(match[1]) : null
}

function parseWeekNumber (text) {
	const match = String(text || '').match(/semana\s*(\d+)/i)
	return match ? Number(match[1]) : null
}

function unitLabel (unitNumber, unitTheme, labels = DEFAULT_LABELS) {
	if (unitTheme) {
		return unitTheme
	}
	if (unitNumber != null) {
		return labels.unitFallback(unitNumber)
	}
	return labels.otherChapters
}

function buildBookIndex (chapters, lessonsByChapterId, labels = {}) {
	const copy = { ...DEFAULT_LABELS, ...labels }
	const rows = chapters.map((chapter, index) => {
		const chapterId = chapter._id ? String(chapter._id) : ''
		const lesson = chapterId
			? lessonsByChapterId.get(chapterId)
			: undefined
		const title = chapterTitle(chapter, index, copy)
		const orderSource = lesson?.mainTitle
			|| lesson?.bookChapter?.chapterTitle
			|| title
		const unitNumber = parseUnitNumber(orderSource)
			?? parseUnitNumber(lesson?.unitTheme)
		const weekNumber = parseWeekNumber(orderSource)
		const chapterNumber = chapter.ChapterNumber
			?? lesson?.bookChapter?.chapterNumber
			?? index + 1

		return {
			chapterId,
			chapterNumber,
			title,
			pageLabel: chapterPageLabel(chapter, copy),
			unitNumber,
			weekNumber,
			unitTheme: lesson?.unitTheme || '',
			heroSubtitle: lesson?.heroSubtitle || '',
			lesson,
			hasWebVersion: Boolean(lesson?.hasContent),
		}
	})

	rows.sort((a, b) => {
		if (a.chapterNumber !== b.chapterNumber) {
			return a.chapterNumber - b.chapterNumber
		}
		return a.title.localeCompare(b.title, 'es')
	})

	const groups = []
	const groupByUnit = new Map()

	for (const row of rows) {
		const key = row.unitNumber ?? 'other'
		if (!groupByUnit.has(key)) {
			groupByUnit.set(key, [])
		}
		groupByUnit.get(key).push(row)
	}

	const sortedKeys = [...groupByUnit.keys()].sort((a, b) => {
		if (a === 'other') {
			return 1
		}
		if (b === 'other') {
			return -1
		}
		return Number(a) - Number(b)
	})

	for (const key of sortedKeys) {
		const items = groupByUnit.get(key)
		const unitNumber = key === 'other' ? null : Number(key)
		const unitTheme = items.find((item) => item.unitTheme)?.unitTheme || ''
		groups.push({
			unitNumber,
			label: unitLabel(unitNumber, unitTheme, copy),
			items,
		})
	}

	return { rows, groups }
}

export {
	buildBookIndex,
	chapterTitle,
	chapterPageLabel,
	parseUnitNumber,
	parseWeekNumber,
	unitLabel,
}
