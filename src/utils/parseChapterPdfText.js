const PAGE_MARKER_RE = /--\s*\d+\s+of\s+\d+\s*--/g
const PAGE_MARKER_TEST_RE = /--\s*\d+\s+of\s+\d+\s*--/
const PAGE_NUMBER_ONLY_RE = /^\d{1,4}$/
const HYPHEN_BREAK_RE = /(\w)-\n(\w)/g

const ACTIVITY_RE = /^(\d+)\.\s*Actividad\s+(individual|en pares|en equipo|con docente)/i
const LETTER_ITEM_RE = /^([a-z])\.\s+(.+)$/i
const BULLET_ITEM_RE = /^[•·]\s+(.+)$/
const NUMBERED_TOPIC_RE = /^(\d+)\s*[·•.-]\s*(.+)$/
const DOC_RE = /^Doc\.\s*(\d+)\s*(.*)$/i
const DOC_INLINE_RE = /Doc\.\s*(\d+)/i

const PHASES = new Set([
	'exploración',
	'exploracion',
	'profundización',
	'profundizacion',
	'consolidación',
	'consolidacion',
	'estrategias',
	'problemas',
	'inicio',
])

const INFO_LABELS = [
	'conexión geográfica',
	'conexion geografica',
	'en la web',
	'conexión ciudadana',
	'conexion ciudadana',
]

const UNIT_INLINE_RE = /^(.+?)\s+Unidad\s+(\d+)(?:\s*[·•.-]\s*Semana\s+(\d+))?$/i
const UNIT_LINE_RE = /^Unidad\s+(\d+)(?:\s*[·•.-]\s*Semana\s+(\d+))?/i
const OBJECTIVES_START_RE = /^En esta unidad aprenderemos a:/i
const H3_COLON_RE = /^([^:]{4,90}):\s*(.+)$/

const ACTIVITY_BADGE = {
	individual: 'blue',
	'en pares': 'green',
	'en equipo': 'orange',
	'con docente': 'blue',
}

// Columns in extracted PDF tables show up as tabs, runs of 2+ spaces, or pipes.
const TABLE_CELL_SPLIT_RE = /\t+|\s{2,}|\s*\|\s*/
const TABLE_PLACEHOLDER_RE = /^@@TABLE_(\d+)@@$/
// "tropicales 45 %", "Boreal: 27 %", "templada (16 %)" → label + value pairs.
const PERCENT_PAIR_RE =
	/([A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,30}?)\s*[:(]?\s*(\d{1,3}(?:[.,]\d+)?)\s*%/g
const CHART_STOPWORDS = new Set([
	'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o',
	'a', 'al', 'que', 'se', 'su', 'sus', 'como', 'entre', 'por', 'para',
	'con', 'es', 'son', 'casi', 'cerca', 'más', 'mas', 'alrededor', 'el',
	'aproximadamente', 'cada', 'otro', 'otra', 'otros', 'otras', 'sólo',
	'solo', 'unos', 'unas',
])
const CHIP_SPLIT_RE = /\s*[,;]\s*|\s+y\s+|\s+e\s+/

function splitRowCells (line) {
	const cells = line
		.split(TABLE_CELL_SPLIT_RE)
		.map((cell) => cell.trim())
		.filter((cell) => cell.length > 0)
	return cells.length >= 2 ? cells : null
}

function modalColumnCount (rows) {
	const counts = {}
	for (const row of rows) {
		counts[row.length] = (counts[row.length] || 0) + 1
	}
	let best = 0
	let bestCount = 0
	for (const [size, freq] of Object.entries(counts)) {
		if (freq > bestCount) {
			bestCount = freq
			best = Number(size)
		}
	}
	return best
}

function normalizeRow (row, colCount) {
	if (row.length === colCount) {
		return row
	}
	if (row.length > colCount) {
		const head = row.slice(0, colCount - 1)
		head.push(row.slice(colCount - 1).join(' '))
		return head
	}
	const padded = row.slice()
	while (padded.length < colCount) {
		padded.push('')
	}
	return padded
}

function looksLikeProseRow (cells) {
	// A real prose line that merely contains a wide gap should not become a
	// table: such rows tend to have one long, sentence-like cell.
	const totalWords = cells.reduce(
		(sum, cell) => sum + cell.split(/\s+/).length,
		0,
	)
	return cells.length === 2 && totalWords > 16
}

// Detect tabular blocks before whitespace is collapsed and replace them with
// placeholder tokens so the body parser can re-insert a structured table.
function extractTables (normalized) {
	const rawLines = normalized.split('\n')
	const tables = []
	const out = []
	let i = 0

	while (i < rawLines.length) {
		const cells = rawLines[i].trim()
			? splitRowCells(rawLines[i].trim())
			: null

		if (cells && !looksLikeProseRow(cells)) {
			const rows = [cells]
			let j = i + 1
			while (j < rawLines.length) {
				const trimmed = rawLines[j].trim()
				if (!trimmed) {
					break
				}
				const next = splitRowCells(trimmed)
				if (!next || looksLikeProseRow(next)) {
					break
				}
				rows.push(next)
				j += 1
			}

			const colCount = modalColumnCount(rows)
			if (rows.length >= 2 && colCount >= 2 && colCount <= 6) {
				const normalized2 = rows.map((row) => normalizeRow(row, colCount))
				const id = tables.length
				tables.push({
					headers: normalized2[0],
					rows: normalized2.slice(1),
				})
				out.push(`@@TABLE_${id}@@`)
				i = j
				continue
			}
		}

		out.push(rawLines[i])
		i += 1
	}

	return { text: out.join('\n'), tables }
}

function cleanChartLabel (raw) {
	const words = String(raw)
		.trim()
		.replace(/[():.,]/g, ' ')
		.split(/\s+/)
		.filter(Boolean)

	while (words.length > 0
		&& (CHART_STOPWORDS.has(words[0].toLowerCase()) || /^\d/.test(words[0]))) {
		words.shift()
	}

	const kept = words.slice(-3).join(' ').trim()
	if (!kept) {
		return ''
	}
	return kept.charAt(0).toUpperCase() + kept.slice(1)
}

// When a block lists a percentage distribution (≥3 labelled values that add up
// to roughly 100 %), surface it as a chart element.
function buildChartFromText (text) {
	const source = String(text || '')
	const pairs = []
	const seen = new Set()
	let match

	PERCENT_PAIR_RE.lastIndex = 0
	while ((match = PERCENT_PAIR_RE.exec(source)) !== null) {
		const label = cleanChartLabel(match[1])
		const value = parseFloat(match[2].replace(',', '.'))
		const key = label.toLowerCase()
		if (label && label.length >= 3 && !Number.isNaN(value) && !seen.has(key)) {
			seen.add(key)
			pairs.push({ label, value })
		}
	}

	if (pairs.length < 3 || pairs.length > 6) {
		return null
	}

	const sum = pairs.reduce((total, pair) => total + pair.value, 0)
	if (sum < 85 || sum > 115) {
		return null
	}

	const chartKind = sum >= 95 && sum <= 105 ? 'donut' : 'bar'
	return {
		type: 'chart',
		text: '',
		items: pairs.map((pair) => ({
			label: pair.label,
			value: String(pair.value),
		})),
		meta: { chartKind, unit: '%' },
	}
}

// Short list of proper-noun-style items → pill chips (e.g. forest names).
function detectChips (line) {
	const trimmed = String(line).trim()
	if (!trimmed || trimmed.length > 90 || /[.:!?]$/.test(trimmed)) {
		return null
	}
	const parts = trimmed
		.split(CHIP_SPLIT_RE)
		.map((part) => part.trim())
		.filter(Boolean)

	if (parts.length < 3 || parts.length > 8) {
		return null
	}

	const allValid = parts.every((part) => {
		const words = part.split(/\s+/)
		return words.length <= 4 && startsUpper(part)
	})

	if (!allValid) {
		return null
	}

	return {
		type: 'chips',
		items: parts.map((part) => ({ text: part })),
	}
}

function preprocessMergedHeader (text) {
	let t = text
	t = t.replace(
		/^(.+?)\s+(Unidad\s+\d+(?:\s*[·•.-]\s*Semana\s+\d+)?)\s+/im,
		'$1\n$2\n',
	)
	t = t.replace(
		/(.+?)\s+(Unidad\s+\d+)\s+(En esta unidad aprenderemos a:)/gi,
		'$1\n$2\n$3',
	)
	t = t.replace(
		/(Unidad\s+\d+)\s+(En esta unidad aprenderemos a:)/gi,
		'$1\n$2',
	)
	return t
}

function normalizeRawText (rawText) {
	return preprocessMergedHeader(
		String(rawText || '')
			.replace(/\r\n/g, '\n')
			.replace(/\r/g, '\n')
			.replace(/\f/g, '\n')
			.replace(/\u00a0/g, ' ')
			.replace(HYPHEN_BREAK_RE, '$1$2')
			.replace(PAGE_MARKER_RE, '\n\n')
			.trim(),
	)
}

function insertStructuralBreaks (text) {
	let t = text

	t = t.replace(
		/\s+(Unidad\s+\d+(?:\s*[·.-]\s*Semana\s+\d+)?)/gi,
		'\n$1\n',
	)
	t = t.replace(/\s+(En esta unidad aprenderemos a:)/gi, '\n$1\n')
	t = t.replace(
		/\s+(\d+\.\s*Actividad\s+(?:individual|en pares|en equipo|con docente))/gi,
		'\n\n$1\n',
	)
	t = t.replace(
		/\s+([a-z]\.\s+(?:¿|[A-ZÁÉÍÓÚÑ]))/g,
		'\n$1',
	)
	t = t.replace(
		/\s+(Exploración|Profundización|Consolidación|Estrategias|Problemas|Inicio|Glosario)\b/g,
		'\n\n$1\n',
	)
	t = t.replace(/\s+(Doc\.\s*\d+)/gi, '\n\n$1\n')
	t = t.replace(
		/(?<!(?:Unidad|Semana)\s)(\d{2,4})\s+(Los\s+[a-záéíóú])/gi,
		'\n\n$2',
	)
	t = t.replace(
		/(?<!(?:Unidad|Semana)\s)(\d{2,4})\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,8}:)/g,
		'\n\n$2',
	)
	t = t.replace(/\s+(Semana\s+\d+\s*[·.-]\s*)/gi, '\n$1')
	t = t.replace(
		/\s+(Conexión geográfica|En la web|Conexión ciudadana)\b/gi,
		'\n\n$1\n',
	)

	return t
}

function linesFromText (text) {
	const withBreaks = insertStructuralBreaks(text)
	return withBreaks
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter((line) => {
			if (!line) {
				return false
			}
			if (PAGE_MARKER_TEST_RE.test(line)) {
				return false
			}
			if (PAGE_NUMBER_ONLY_RE.test(line)) {
				return false
			}
			if (/^--\s*\d/.test(line)) {
				return false
			}
			return true
		})
}

function isPhaseLine (line) {
	return PHASES.has(line.trim().toLowerCase())
}

function isInfoLabel (line) {
	const lower = line.trim().toLowerCase()
	return INFO_LABELS.some((label) => lower.startsWith(label)
		|| lower === label)
}

function isLikelyH3 (line) {
	const trimmed = line.trim()
	if (!trimmed || trimmed.length > 120) {
		return false
	}
	if (trimmed.endsWith('.') || trimmed.endsWith('?') || trimmed.endsWith('!')) {
		return false
	}
	if (ACTIVITY_RE.test(trimmed)) {
		return false
	}
	if (LETTER_ITEM_RE.test(trimmed)) {
		return false
	}
	if (DOC_RE.test(trimmed)) {
		return false
	}
	if (isPhaseLine(trimmed)) {
		return false
	}
	if (NUMBERED_TOPIC_RE.test(trimmed)) {
		return false
	}
	if (/^Unidad\s+\d/i.test(trimmed)) {
		return false
	}
	if (/^En esta unidad/i.test(trimmed)) {
		return false
	}
	if (/[,:;]$/.test(trimmed)) {
		return false
	}
	const lower = trimmed.charAt(0)
	if (lower && lower === lower.toLowerCase() && lower !== lower.toUpperCase()) {
		return false
	}
	const lastWord = trimmed
		.split(/\s+/)
		.pop()
		.toLowerCase()
		.replace(/[^a-záéíóúñ]/g, '')
	if (TRAILING_FUNCTION_WORD_RE.test(lastWord)) {
		return false
	}
	const words = trimmed.split(/\s+/).length
	return words <= 14
}

const TERMINAL_RE = /[.?!…]['")\]»]?$/
const TRAILING_FUNCTION_WORD_RE = new RegExp(
	'^(?:el|la|los|las|un|una|unos|unas|de|del|en|y|o|u|a|al|e|ni|que'
	+ '|se|su|sus|lo|le|les|como|sin|so|sobre|entre|hacia|desde|para'
	+ '|por|con|es|son|fue|ha|han|muy|más|mas|este|esta|estos|estas'
	+ '|ese|esa|esos|esas|cuyo|cuya|donde|cuando|tan)$',
	'i',
)

function endsWithTerminal (text) {
	return TERMINAL_RE.test(String(text).trim())
}

function startsUpper (text) {
	const trimmed = String(text).trim()
	if (!trimmed) {
		return false
	}
	const first = trimmed.charAt(0)
	if (first === '¿' || first === '¡') {
		return true
	}
	return first === first.toUpperCase() && first !== first.toLowerCase()
}

// A genuine heading is short, starts with a capital, does not end with a
// comma/colon or sentence punctuation, and does not trail off on a Spanish
// function word (a strong signal that the line is a wrapped sentence).
function looksLikeHeadingBlock (text) {
	const trimmed = String(text).trim()
	if (!trimmed || trimmed.length > 100) {
		return false
	}
	if (/[,:;]$/.test(trimmed) || endsWithTerminal(trimmed)) {
		return false
	}
	if (!startsUpper(trimmed)) {
		return false
	}
	if (trimmed.split(/\s+/).length > 12) {
		return false
	}
	const lastWord = trimmed
		.split(/\s+/)
		.pop()
		.toLowerCase()
		.replace(/[^a-záéíóúñ]/g, '')
	if (TRAILING_FUNCTION_WORD_RE.test(lastWord)) {
		return false
	}
	return true
}

function isStructuralLine (line) {
	return (
		TABLE_PLACEHOLDER_RE.test(line)
		|| ACTIVITY_RE.test(line)
		|| DOC_RE.test(line)
		|| isPhaseLine(line)
		|| BULLET_ITEM_RE.test(line)
		|| LETTER_ITEM_RE.test(line)
		|| NUMBERED_TOPIC_RE.test(line)
		|| isInfoLabel(line)
		|| UNIT_LINE_RE.test(line)
		|| OBJECTIVES_START_RE.test(line)
		|| /^glosario$/i.test(line)
		|| /^profundización$/i.test(line)
	)
}

// PDF text extraction wraps each visual line. Without this step every short
// wrapped fragment is misread as a heading. We rejoin consecutive prose lines
// into full paragraphs, only breaking on real sentence ends, structural
// markers, or genuine headings.
function reflowParagraphLines (lines) {
	const out = []
	let buffer = ''

	const flush = () => {
		const merged = buffer.trim()
		if (merged) {
			out.push(merged)
		}
		buffer = ''
	}

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i]

		if (isStructuralLine(line)) {
			flush()
			out.push(line)
			continue
		}

		if (!buffer) {
			buffer = line
			continue
		}

		if (endsWithTerminal(buffer)) {
			flush()
			buffer = line
			continue
		}

		if (looksLikeHeadingBlock(buffer) && startsUpper(line)) {
			flush()
			buffer = line
			continue
		}

		buffer = `${buffer} ${line}`
	}

	flush()
	return out
}

function parseHeaderFromLines (lines, fallbackTitle) {
	let unitTheme = ''
	let mainTitle = fallbackTitle || ''
	let heroSubtitle = ''
	let objectivesText = ''
	let bodyStartIndex = 0

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i]
		const inlineMatch = line.match(UNIT_INLINE_RE)
		const unitMatch = line.match(UNIT_LINE_RE)

		if (inlineMatch) {
			unitTheme = inlineMatch[1].trim()
			const unidad = inlineMatch[2]
			const semana = inlineMatch[3]
			mainTitle = semana
				? `Unidad ${unidad} · Semana ${semana}`
				: `Unidad ${unidad}`
			bodyStartIndex = i + 1
			break
		}

		if (unitMatch) {
			if (i > 0) {
				unitTheme = lines.slice(0, i).join(' ').trim()
			}
			const unidad = unitMatch[1]
			const semana = unitMatch[2]
			mainTitle = semana
				? `Unidad ${unidad} · Semana ${semana}`
				: `Unidad ${unidad}`
			bodyStartIndex = i + 1
			break
		}
	}

	for (let i = bodyStartIndex; i < lines.length; i += 1) {
		const line = lines[i]
		if (OBJECTIVES_START_RE.test(line)) {
			const rest = line.replace(OBJECTIVES_START_RE, '').trim()
			const objParts = rest ? [rest] : []
			let j = i + 1
			while (j < lines.length) {
				const next = lines[j]
				if (
					ACTIVITY_RE.test(next)
					|| isPhaseLine(next)
					|| isLikelyH3(next)
					|| DOC_RE.test(next)
					|| UNIT_LINE_RE.test(next)
				) {
					break
				}
				objParts.push(next)
				j += 1
			}
			objectivesText = objParts.join(' ').trim()
			bodyStartIndex = j
			break
		}
	}

	for (let i = bodyStartIndex; i < lines.length; i += 1) {
		const line = lines[i]
		if (
			ACTIVITY_RE.test(line)
			|| isPhaseLine(line)
			|| DOC_RE.test(line)
		) {
			break
		}
		const colonMatch = line.match(H3_COLON_RE)
		if (colonMatch && colonMatch[1].split(/\s+/).length <= 12) {
			heroSubtitle = line.trim()
			bodyStartIndex = i + 1
			break
		}
		if (isLikelyH3(line) && !isInfoLabel(line)) {
			heroSubtitle = line
			bodyStartIndex = i + 1
			break
		}
	}

	return {
		unitTheme,
		mainTitle,
		heroSubtitle,
		objectivesText,
		bodyStartIndex,
	}
}

function splitColonHeadingParagraph (line) {
	const merged = line.match(
		/^([^:]{3,90}:\s*[^.!?]{1,100}?)(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ].{25,})$/,
	)
	if (merged) {
		return {
			heading: merged[1].trim(),
			body: merged[2].trim(),
		}
	}

	const match = line.match(H3_COLON_RE)
	if (!match) {
		return null
	}
	const heading = match[1].trim()
	const body = match[2].trim()
	if (heading.split(/\s+/).length > 14 || heading.length > 100) {
		return null
	}
	if (body.split(/\s+/).length <= 12 && !body.includes('.')) {
		return { heading: `${heading}: ${body}`, body: '' }
	}
	if (!body) {
		return { heading, body: '' }
	}
	return { heading, body }
}

function pushParagraph (elements, buffer) {
	const merged = buffer.join(' ').trim()
	buffer.length = 0
	if (!merged) {
		return
	}

	const colonParts = splitColonHeadingParagraph(merged)
	if (colonParts && colonParts.body) {
		elements.push({ type: 'h3', text: colonParts.heading })
		elements.push({ type: 'p', text: colonParts.body })
		return
	}

	elements.push({ type: 'p', text: merged })
}

function parseActivityBlock (lines, startIndex) {
	const first = lines[startIndex]
	const match = first.match(ACTIVITY_RE)
	if (!match) {
		return { element: null, nextIndex: startIndex + 1 }
	}

	const activityNumber = Number(match[1])
	const activityKind = match[2].toLowerCase()
	const items = []
	let introText = first.replace(ACTIVITY_RE, '').trim()
	let i = startIndex + 1

	while (i < lines.length) {
		const line = lines[i]
		if (ACTIVITY_RE.test(line) || isPhaseLine(line)) {
			break
		}
		if (isLikelyH3(line) && items.length > 0) {
			break
		}
		if (DOC_RE.test(line) || TABLE_PLACEHOLDER_RE.test(line)) {
			break
		}

		const letterMatch = line.match(LETTER_ITEM_RE)
		const bulletMatch = line.match(BULLET_ITEM_RE)

		if (letterMatch) {
			items.push({
				label: letterMatch[1],
				text: letterMatch[2].trim(),
			})
		} else if (bulletMatch) {
			items.push({
				label: '•',
				text: bulletMatch[1].trim(),
			})
		} else if (items.length === 0 && !introText) {
			introText = line
		} else if (items.length > 0) {
			const last = items[items.length - 1]
			last.text = `${last.text} ${line}`.trim()
		} else {
			introText = introText
				? `${introText} ${line}`.trim()
				: line
		}
		i += 1
	}

	return {
		element: {
			type: 'activity',
			text: introText,
			items,
			meta: {
				activityNumber,
				activityKind,
				badge: ACTIVITY_BADGE[activityKind] || 'blue',
			},
		},
		nextIndex: i,
	}
}

function parseDocBlock (lines, startIndex) {
	const first = lines[startIndex]
	const match = first.match(DOC_RE)
	if (!match) {
		return { element: null, nextIndex: startIndex + 1 }
	}

	const docNumber = match[1]
	const parts = [match[2].trim()].filter(Boolean)
	let i = startIndex + 1

	while (i < lines.length) {
		const line = lines[i]
		if (
			ACTIVITY_RE.test(line)
			|| isPhaseLine(line)
			|| DOC_RE.test(line)
			|| TABLE_PLACEHOLDER_RE.test(line)
			|| (isLikelyH3(line) && parts.length > 0)
		) {
			break
		}
		parts.push(line)
		i += 1
	}

	return {
		element: {
			type: 'doc',
			text: parts[0] || `Doc. ${docNumber}`,
			items: parts.slice(1).map((part) => ({ text: part })),
			meta: { docNumber },
		},
		nextIndex: i,
	}
}

function parseProfundizacionBlock (lines, startIndex) {
	const items = []
	let i = startIndex + 1

	while (i < lines.length) {
		const line = lines[i]
		if (
			isPhaseLine(line)
			|| ACTIVITY_RE.test(line)
			|| DOC_RE.test(line)
			|| TABLE_PLACEHOLDER_RE.test(line)
			|| (isLikelyH3(line) && items.length > 0)
		) {
			break
		}

		const parts = line.split(/\.\s+/).filter(Boolean)
		if (parts.length >= 2 && parts[0].length <= 30) {
			items.push({
				title: parts[0].trim(),
				body: parts.slice(1).join('. ').trim(),
			})
		} else if (items.length > 0) {
			const last = items[items.length - 1]
			last.body = `${last.body} ${line}`.trim()
		} else {
			items.push({ title: '', body: line })
		}
		i += 1
	}

	return {
		element: {
			type: 'profundizacion',
			text: 'Profundización',
			items,
		},
		nextIndex: i,
	}
}

function parseNumberedListRun (lines, startIndex) {
	const items = []
	let i = startIndex

	while (i < lines.length) {
		const match = lines[i].match(NUMBERED_TOPIC_RE)
		if (!match) {
			break
		}
		items.push({
			label: match[1],
			title: match[2].trim(),
			body: '',
		})
		i += 1
		if (i < lines.length && !NUMBERED_TOPIC_RE.test(lines[i])) {
			const bodyLine = lines[i]
			if (
				!ACTIVITY_RE.test(bodyLine)
				&& !isLikelyH3(bodyLine)
				&& !isPhaseLine(bodyLine)
			) {
				items[items.length - 1].body = bodyLine
				i += 1
			}
		}
	}

	return {
		element: items.length > 0
			? { type: 'numberedList', items }
			: null,
		nextIndex: i,
	}
}

function parseBodyLines (lines, startIndex, tables = []) {
	const elements = []
	const paragraphBuffer = []
	let i = startIndex

	while (i < lines.length) {
		const line = lines[i]

		const tableMatch = line.match(TABLE_PLACEHOLDER_RE)
		if (tableMatch) {
			pushParagraph(elements, paragraphBuffer)
			const table = tables[Number(tableMatch[1])]
			if (table) {
				elements.push({
					type: 'table',
					text: '',
					items: table.rows.map((row) => ({ cells: row })),
					meta: { headers: table.headers },
				})
			}
			i += 1
			continue
		}

		if (ACTIVITY_RE.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const { element, nextIndex } = parseActivityBlock(lines, i)
			if (element) {
				elements.push(element)
			}
			i = nextIndex
			continue
		}

		if (DOC_RE.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const { element, nextIndex } = parseDocBlock(lines, i)
			if (element) {
				elements.push(element)
			}
			i = nextIndex
			continue
		}

		if (isPhaseLine(line)) {
			pushParagraph(elements, paragraphBuffer)
			elements.push({
				type: 'phase',
				text: line,
				meta: { phase: line.toLowerCase() },
			})
			i += 1
			continue
		}

		if (/^profundización$/i.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const { element, nextIndex } = parseProfundizacionBlock(lines, i)
			if (element) {
				elements.push(element)
			}
			i = nextIndex
			continue
		}

		if (/^glosario$/i.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const glossaryItems = []
			let j = i + 1
			while (j < lines.length) {
				const gLine = lines[j]
				if (
					isPhaseLine(gLine)
					|| ACTIVITY_RE.test(gLine)
					|| TABLE_PLACEHOLDER_RE.test(gLine)
					|| (isLikelyH3(gLine) && glossaryItems.length > 0)
				) {
					break
				}
				const dotParts = gLine.split(/\.\s+/)
				if (dotParts.length >= 2 && dotParts[0].length <= 40) {
					glossaryItems.push({
						title: dotParts[0].trim(),
						body: dotParts.slice(1).join('. ').trim(),
					})
				} else if (glossaryItems.length > 0) {
					const last = glossaryItems[glossaryItems.length - 1]
					last.body = `${last.body} ${gLine}`.trim()
				}
				j += 1
			}
			elements.push({
				type: 'glossary',
				text: 'Glosario',
				items: glossaryItems,
			})
			i = j
			continue
		}

		if (NUMBERED_TOPIC_RE.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const { element, nextIndex } = parseNumberedListRun(lines, i)
			if (element) {
				elements.push(element)
			}
			i = nextIndex
			continue
		}

		if (isInfoLabel(line)) {
			pushParagraph(elements, paragraphBuffer)
			const infoParts = []
			let j = i + 1
			while (j < lines.length) {
				const infoLine = lines[j]
				if (
					isLikelyH3(infoLine)
					|| ACTIVITY_RE.test(infoLine)
					|| isPhaseLine(infoLine)
					|| DOC_RE.test(infoLine)
					|| TABLE_PLACEHOLDER_RE.test(infoLine)
				) {
					break
				}
				infoParts.push(infoLine)
				j += 1
			}
			elements.push({
				type: 'info',
				text: line,
				items: infoParts.map((part) => ({ text: part })),
			})
			i = j
			continue
		}

		const chips = detectChips(line)
		if (chips) {
			pushParagraph(elements, paragraphBuffer)
			elements.push(chips)
			i += 1
			continue
		}

		if (isLikelyH3(line)) {
			pushParagraph(elements, paragraphBuffer)
			const colonParts = splitColonHeadingParagraph(line)
			if (colonParts) {
				elements.push({ type: 'h3', text: colonParts.heading })
				if (colonParts.body) {
					elements.push({ type: 'p', text: colonParts.body })
				}
			} else {
				elements.push({ type: 'h3', text: line })
			}
			i += 1
			continue
		}

		if (BULLET_ITEM_RE.test(line)) {
			pushParagraph(elements, paragraphBuffer)
			const bulletItems = []
			let j = i
			while (j < lines.length && BULLET_ITEM_RE.test(lines[j])) {
				const bulletMatch = lines[j].match(BULLET_ITEM_RE)
				bulletItems.push({ text: bulletMatch[1].trim() })
				j += 1
			}
			elements.push({ type: 'bulletList', items: bulletItems })
			i = j
			continue
		}

		// Lines are already reflowed into complete paragraphs upstream, so
		// each plain line is emitted as its own paragraph instead of being
		// merged with neighbouring blocks.
		pushParagraph(elements, [line])
		i += 1
	}

	pushParagraph(elements, paragraphBuffer)
	return elements
}

// Surface percentage distributions hidden inside paragraphs and doc boxes as
// chart elements rendered right after their source block.
function injectCharts (content) {
	const out = []
	for (const element of content) {
		out.push(element)
		if (element.type !== 'p' && element.type !== 'doc') {
			continue
		}
		const text = element.type === 'doc'
			? [element.text, ...(element.items || []).map((item) => item.text)]
				.filter(Boolean)
				.join(' ')
			: element.text
		const chart = buildChartFromText(text)
		if (chart) {
			out.push(chart)
		}
	}
	return out
}

/**
 * Parse extracted PDF text into structured lesson elements.
 */
export function parseChapterPdfText (rawText, fallbackTitle = '') {
	const normalized = normalizeRawText(rawText)
	if (!normalized) {
		return {
			mainTitle: fallbackTitle || 'Chapter lesson',
			unitTheme: '',
			heroSubtitle: '',
			content: [],
		}
	}

	const { text: tableCleaned, tables } = extractTables(normalized)
	const lines = reflowParagraphLines(linesFromText(tableCleaned))
	const header = parseHeaderFromLines(lines, fallbackTitle)
	const content = injectCharts(
		parseBodyLines(lines, header.bodyStartIndex, tables),
	)

	if (content.length === 0 && normalized) {
		content.push({ type: 'p', text: normalized })
	}

	return {
		mainTitle: header.mainTitle || fallbackTitle || 'Chapter lesson',
		unitTheme: header.unitTheme,
		heroSubtitle: header.heroSubtitle,
		objectivesText: header.objectivesText,
		content,
	}
}
