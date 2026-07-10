function appendLine (lines, line) {
	const trimmed = line != null ? String(line).trim() : ''
	if (trimmed) {
		lines.push(trimmed)
	}
}

function extractItemText (item) {
	if (!item || typeof item !== 'object') {
		return ''
	}

	const parts = []
	if (item.label && item.label !== '•') {
		parts.push(String(item.label))
	}
	if (item.title) {
		parts.push(String(item.title))
	}
	if (item.body) {
		parts.push(String(item.body))
	}
	if (item.text) {
		parts.push(String(item.text))
	}
	if (item.value) {
		parts.push(String(item.value))
	}
	if (Array.isArray(item.cells)) {
		const cells = item.cells
			.filter((cell) => cell != null && String(cell).trim() !== '')
			.map((cell) => String(cell).trim())
		if (cells.length > 0) {
			parts.push(cells.join(' | '))
		}
	}

	return parts.filter(Boolean).join(' ')
}

function extractBlockText (block) {
	const type = block?.type || 'p'
	const text = block?.text ? String(block.text).trim() : ''
	const items = Array.isArray(block?.items) ? block.items : []
	const meta = block?.meta || {}
	const lines = []

	switch (type) {
	case 'doc':
		if (meta.docNumber) {
			appendLine(lines, `Doc. ${meta.docNumber}`)
		}
		appendLine(lines, text)
		for (const item of items) {
			appendLine(lines, item?.text)
		}
		break
	case 'numberedList':
	case 'bulletList':
		for (const item of items) {
			if (item?.title) {
				const body = item.body ? `: ${item.body}` : ''
				appendLine(lines, `${item.title}${body}`)
			} else {
				appendLine(lines, item?.body || item?.text)
			}
		}
		break
	case 'table':
		appendLine(lines, text)
		if (Array.isArray(meta.headers) && meta.headers.length > 0) {
			appendLine(lines, meta.headers.join(' | '))
		}
		for (const item of items) {
			if (Array.isArray(item?.cells)) {
				appendLine(lines, item.cells.join(' | '))
			}
		}
		break
	case 'chart':
		appendLine(lines, text)
		if (meta.unit) {
			appendLine(lines, String(meta.unit))
		}
		for (const item of items) {
			appendLine(lines, extractItemText(item))
		}
		break
	default:
		appendLine(lines, text)
		for (const item of items) {
			appendLine(lines, extractItemText(item))
		}
	}

	return lines
}

function extractBookLessonText (lesson) {
	const parts = []

	if (lesson?.mainTitle) {
		appendLine(parts, lesson.mainTitle)
	}
	if (lesson?.unitTheme) {
		appendLine(parts, lesson.unitTheme)
	}
	if (lesson?.heroSubtitle) {
		appendLine(parts, lesson.heroSubtitle)
	}
	if (lesson?.objectivesText) {
		appendLine(parts, lesson.objectivesText)
	}

	const content = Array.isArray(lesson?.content) ? lesson.content : []
	for (const block of content) {
		parts.push(...extractBlockText(block))
	}

	return parts.join('\n\n')
}

export {
	extractBookLessonText,
	extractBlockText,
	extractItemText,
}
