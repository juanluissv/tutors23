function chapterTitle (chapter, index) {
	const title = chapter?.ChapterTitle
		? String(chapter.ChapterTitle).trim()
		: ''
	if (title) {
		return title
	}
	return `Chapter ${chapter?.ChapterNumber ?? index + 1}`
}

function chapterPageLabel (chapter) {
	const start = chapter?.ChapterBeginPage
	const end = chapter?.ChapterEndPage
	if (start != null && end != null) {
		return `Pages ${start}–${end}`
	}
	if (start != null) {
		return `From page ${start}`
	}
	if (end != null) {
		return `Through page ${end}`
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

function unitLabel (unitNumber, unitTheme) {
	if (unitTheme) {
		return unitTheme
	}
	if (unitNumber != null) {
		return `Unidad ${unitNumber}`
	}
	return 'Other chapters'
}

function buildBookIndex (chapters, lessonsByChapterId) {
	const rows = chapters.map((chapter, index) => {
		const chapterId = chapter._id ? String(chapter._id) : ''
		const lesson = chapterId
			? lessonsByChapterId.get(chapterId)
			: undefined
		const title = chapterTitle(chapter, index)
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
			pageLabel: chapterPageLabel(chapter),
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
			label: unitLabel(unitNumber, unitTheme),
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
