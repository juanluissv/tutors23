import OpenAI from 'openai'
import { PDFDocument } from 'pdf-lib'
import dotenv from 'dotenv'
import { extractPdfPageRange } from './extractChapterPdf.js'
import { assignBlockIds } from './lessonBlockIds.js'

dotenv.config()

const VISION_MODEL = process.env.LESSON_VISION_MODEL || 'gpt-4o'
// Base64 inflates payloads ~33 %; keep well under the Responses API limits.
const MAX_PDF_BYTES = 24 * 1024 * 1024
const PAGE_BY_PAGE = process.env.LESSON_VISION_PAGE_BY_PAGE !== 'false'

const ALLOWED_TYPES = new Set([
	'eyebrow',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'p',
	'objectives',
	'phase',
	'activity',
	'doc',
	'info',
	'glossary',
	'profundizacion',
	'numberedList',
	'bulletList',
	'table',
	'chart',
	'diagram',
	'map',
	'figure',
	'chips',
])

const ACTIVITY_KINDS = new Set([
	'individual',
	'en pares',
	'en equipo',
	'con docente',
])

let cachedClient = null

function getClient () {
	if (!process.env.OPENAI_API_KEY) {
		return null
	}
	if (!cachedClient) {
		cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	}
	return cachedClient
}

function isVisionEnabled () {
	return (
		Boolean(process.env.OPENAI_API_KEY)
		&& process.env.LESSON_VISION_DISABLED !== 'true'
	)
}

const SYSTEM_PROMPT = [
	'Eres un experto en diseño instruccional que convierte un capítulo de un',
	'libro de texto escolar (en formato PDF, con texto, tablas, gráficos,',
	'mapas, diagramas e infografías) en una lección estructurada en JSON.',
	'Tu objetivo es la TRANSCRIPCIÓN COMPLETA, no el resumen: incluye TODO el',
	'texto del capítulo, de todas las páginas, palabra por palabra, sin',
	'acortar, parafrasear, condensar ni omitir nada. Reconstruye los párrafos',
	'completos (une las líneas cortadas por el ajuste de línea del PDF).',
	'Conserva el idioma original (normalmente español) y no inventes datos que',
	'no aparezcan en el documento. NUNCA descartes el texto que aparezca dentro',
	'de figuras, recuadros, flechas, leyendas, mapas, diagramas o infografías:',
	'ese texto SIEMPRE debe terminar en el JSON, aunque tengas que ponerlo en',
	'un bloque genérico.',
].join(' ')

function buildSchemaPrompt (fallbackTitle) {
	return [
		'Convierte el capítulo en un objeto JSON con esta forma exacta:',
		'{',
		'  "mainTitle": string,        // p. ej. "Unidad 1 · Semana 1"',
		'  "unitTheme": string,        // tema de la unidad (encabezado)',
		'  "heroSubtitle": string,     // título temático del capítulo',
		'  "objectivesText": string,   // texto tras "En esta unidad aprenderemos a:"',
		'  "content": Element[]',
		'}',
		'',
		'"heroSubtitle" es el título principal del contenido del capítulo',
		'(p. ej. "Los bosques tropicales en el mundo"), distinto de unitTheme.',
		'',
		'Cada Element es: { "type": string, "text"?: string, "items"?: Item[],',
		'"meta"?: object }. Item es: { "label"?, "title"?, "body"?, "text"?,',
		'"value"?, "cells"?: string[] }.',
		'',
		'Usa SOLO estos type y respeta su significado:',
		'- "phase": fase del libro (Exploración, Profundización, Consolidación…).',
		'  text = nombre de la fase. Empieza una fase nueva donde el libro la marque.',
		'- "h2"/"h3": subtítulos de sección. text = título.',
		'- "p": párrafo completo de texto corrido.',
		'- "activity": actividad numerada. meta.activityNumber (número),',
		'  meta.activityKind ("individual" | "en pares" | "en equipo" |',
		'  "con docente"). text = enunciado/título corto. items = pasos con',
		'  label "a","b","c"… y text.',
		'- "doc": recuadro "Doc. N" SIN gráfico de porcentajes. meta.docNumber,',
		'  text = título, items = párrafos de texto (incluye la fuente).',
		'- "info": llamado lateral ("En la web", "Conexión geográfica",',
		'  "Conexión ciudadana"). text = etiqueta, items = texto.',
		'- "glossary": glosario o cajas laterales de definición (p. ej.',
		'  "La deforestación", "La contaminación"). items = { title: término,',
		'  body: definición }.',
		'- "table": tabla. meta.headers = string[] de encabezados; items = filas,',
		'  cada una { cells: string[] } en el mismo orden de columnas.',
		'  Tablas plantilla (solo encabezados para que el estudiante complete):',
		'  meta.isTemplate = true, meta.headers con los encabezados, items = []',
		'  o una fila con celdas vacías "".',
		'- "chart": gráfico de datos (pastel, dona, barras). items =',
		'  { label, value } donde value es solo el número. meta.chartKind =',
		'  "donut" si las partes suman ~100, si no "bar". meta.unit (p. ej. "%").',
		'  Si un recuadro "Doc. N" contiene un gráfico circular con porcentajes,',
		'  usa "chart" (no "doc") y pon la fuente en un "p" aparte.',
		'- "diagram": diagrama, esquema o infografía con un concepto central y',
		'  varias cajas o ramas (p. ej. "Causas históricas" o un esquema de',
		'  "Estrategias" / "Problemas que afectan a…" en actividades).',
		'  text = la etiqueta o título central del diagrama. items = una caja por',
		'  cada rama, cada una con { title, body } (body puede ir vacío si la caja',
		'  solo tiene título).',
		'- "map": mapa temático. text = título del mapa. items = cada recuadro',
		'  o etiqueta del mapa con { title: región, body?: texto del recuadro }.',
		'  Si una etiqueta del mapa NO tiene texto explicativo, inclúyela igual',
		'  con solo title. La leyenda de colores va ADEMÁS como "table" o',
		'  "bulletList".',
		'- "figure": CUALQUIER otra figura, ilustración o elemento visual que no',
		'  encaje en chart, table, diagram o map. text = título o descripción',
		'  breve; items = { text } con TODO el texto que aparezca dentro o junto',
		'  a la figura.',
		'- Recuadros de estudio de caso por país o región (p. ej. "Brasil",',
		'  "México", "América del Sur", "Centro de África", "Sudeste asiático"),',
		'  cuando son párrafos del cuerpo con h3 + texto, usa h3 + p (NO "map").',
		'  Solo usa "map" si el recuadro está sobre o junto a un mapa visible.',
		'- "chips": lista corta de nombres propios. items = { text }.',
		'- "numberedList"/"bulletList": listas. items con title/body o text.',
		'- "objectives": objetivos de aprendizaje. items = { text }.',
		'',
		'IMPORTANTE para gráficos y tablas: si una figura del PDF es un gráfico',
		'de pastel, de barras o un mapa con porcentajes, EXTRAE sus datos a un',
		'"chart" o "table". Incluye también la fuente del documento como un "p".',
		'',
		'Ejemplo de "diagram" (esquema con cajas):',
		'{ "type": "diagram", "text": "Causas históricas", "items": [',
		'  { "title": "El despojo y la concentración de tierras",',
		'    "body": "Durante los procesos de colonización, las potencias..." },',
		'  { "title": "Los impactos socioeconómicos desiguales",',
		'    "body": "Las relaciones comerciales asimétricas..." } ] }',
		'',
		'Ejemplo de esquema en actividad:',
		'{ "type": "diagram", "text": "Estrategias", "items": [',
		'  { "title": "Problemas que afectan a los bosques tropicales" } ] }',
		'',
		'Ejemplo de tabla plantilla:',
		'{ "type": "table", "text": "Tabla de estrategias",',
		'  "meta": { "headers": ["Estrategia", "Descripción"], "isTemplate": true },',
		'  "items": [] }',
		'',
		'Ejemplo de sección regional (cuerpo, NO mapa):',
		'{ "type": "h3", "text": "América del Sur" },',
		'{ "type": "p", "text": "Según el informe de 2022 presentado por WWF..." }',
		'',
		'Ejemplo de "map" (mapa con recuadros) y su leyenda:',
		'{ "type": "map", "text": "Conflictos por la tierra en América Latina",',
		'  "items": [',
		'  { "title": "México", "body": "En Chiapas, los campesinos han..." },',
		'  { "title": "Brasil", "body": "En 1964, el gobierno estableció..." } ] }',
		'{ "type": "table", "text": "Leyenda del mapa",',
		'  "meta": { "headers": ["Categoría", "Significado"] }, "items": [',
		'  { "cells": ["Reforma agraria tras lucha armada", "..."] } ] }',
		'',
		'REGLA DE RESPALDO (MUY IMPORTANTE): si no logras clasificar una figura',
		'(gráfico, mapa, diagrama o infografía), NO la omitas. Extrae todo su',
		'texto como "figure" o, en último caso, como párrafos "p" y listas',
		'"bulletList". Siempre es preferible incluir el texto en un bloque',
		'genérico que perderlo.',
		'',
		'El texto corrido del cuerpo y el texto de los recuadros laterales',
		'(glosarios, "Conexión geográfica", esquemas, mapas) coexisten en la',
		'misma página: incluye AMBOS. No descartes un párrafo del cuerpo solo',
		'porque haya una figura o caja a su lado; cada párrafo principal debe',
		'aparecer como su propio "p", completo y palabra por palabra.',
		'',
		'Antes de responder, recorre el PDF página por página y verifica que',
		'NINGÚN bloque de texto, párrafo del cuerpo, recuadro, caja, pie de',
		'figura, fuente o leyenda haya quedado fuera del JSON. Si una página',
		'tiene 4 párrafos y 3 recuadros, el JSON de esa página debe contener los',
		'4 párrafos y los 3 recuadros.',
		'',
		fallbackTitle
			? `Si no encuentras un título claro, usa: "${fallbackTitle}".`
			: '',
		'',
		'Responde ÚNICAMENTE con el objeto JSON, sin markdown ni explicaciones.',
	].filter(Boolean).join('\n')
}

function buildUserPrompt (fallbackTitle) {
	return buildSchemaPrompt(fallbackTitle)
}

function buildPagePrompt (fallbackTitle, pageNumber, totalPages) {
	return [
		buildSchemaPrompt(fallbackTitle),
		'',
		`IMPORTANTE: estás procesando SOLO la página ${pageNumber} de ${totalPages}.`,
		'Extrae TODO el contenido visible en ESTA página únicamente.',
		'No omitas párrafos del cuerpo aunque haya mapas o cajas al lado.',
		pageNumber === 1
			? 'Incluye mainTitle, unitTheme, heroSubtitle y objectivesText si aparecen.'
			: 'Para mainTitle/unitTheme/heroSubtitle/objectivesText usa "" salvo que '
				+ 'aparezcan explícitamente en esta página.',
		'No repitas encabezados de folio ("Unidad X · Semana Y") como content.',
		'Devuelve content[] con los bloques de esta página en orden de lectura.',
	].join('\n')
}

function toStr (value) {
	if (value == null) {
		return ''
	}
	return String(value).trim()
}

function sanitizeItem (item) {
	if (!item || typeof item !== 'object') {
		return null
	}
	const cells = Array.isArray(item.cells)
		? item.cells.map((cell) => toStr(cell))
		: []
	const sanitized = {
		label: toStr(item.label),
		title: toStr(item.title),
		body: toStr(item.body),
		text: toStr(item.text),
		value: toStr(item.value),
		cells,
	}
	const hasContent = sanitized.label
		|| sanitized.title
		|| sanitized.body
		|| sanitized.text
		|| sanitized.value
		|| cells.length > 0
	return hasContent ? sanitized : null
}

function sanitizeMeta (meta) {
	if (!meta || typeof meta !== 'object') {
		return {}
	}
	const result = {}
	if (meta.activityNumber != null && !Number.isNaN(Number(meta.activityNumber))) {
		result.activityNumber = Number(meta.activityNumber)
	}
	const kind = toStr(meta.activityKind).toLowerCase()
	if (ACTIVITY_KINDS.has(kind)) {
		result.activityKind = kind
	}
	if (toStr(meta.docNumber)) {
		result.docNumber = toStr(meta.docNumber)
	}
	if (toStr(meta.phase)) {
		result.phase = toStr(meta.phase)
	}
	const chartKind = toStr(meta.chartKind).toLowerCase()
	if (chartKind === 'donut' || chartKind === 'bar') {
		result.chartKind = chartKind
	}
	if (toStr(meta.unit)) {
		result.unit = toStr(meta.unit)
	}
	if (Array.isArray(meta.headers)) {
		result.headers = meta.headers.map((header) => toStr(header))
	}
	if (meta.isTemplate === true) {
		result.isTemplate = true
	}
	return result
}

function sanitizeElement (element) {
	if (!element || typeof element !== 'object') {
		return null
	}
	const type = ALLOWED_TYPES.has(element.type) ? element.type : 'p'
	const text = toStr(element.text)
	const items = Array.isArray(element.items)
		? element.items.map(sanitizeItem).filter(Boolean)
		: []
	const meta = sanitizeMeta(element.meta)

	if (!text && items.length === 0 && type !== 'phase') {
		return null
	}

	return { type, text, items, meta }
}

function sanitizeLesson (data, fallbackTitle) {
	const safe = data && typeof data === 'object' ? data : {}
	const content = Array.isArray(safe.content)
		? safe.content.map(sanitizeElement).filter(Boolean)
		: []

	return {
		mainTitle: toStr(safe.mainTitle) || fallbackTitle || 'Chapter lesson',
		unitTheme: toStr(safe.unitTheme),
		heroSubtitle: toStr(safe.heroSubtitle),
		objectivesText: toStr(safe.objectivesText),
		content: assignBlockIds(content),
	}
}

function parseJsonOutput (raw) {
	const text = toStr(raw)
	if (!text) {
		throw new Error('Vision model returned an empty response')
	}
	const cleaned = text
		.replace(/^```(?:json)?\s*/i, '')
		.replace(/\s*```$/i, '')
		.trim()
	try {
		return JSON.parse(cleaned)
	} catch (parseErr) {
		const start = cleaned.indexOf('{')
		const end = cleaned.lastIndexOf('}')
		if (start >= 0 && end > start) {
			return JSON.parse(cleaned.slice(start, end + 1))
		}
		throw parseErr
	}
}

async function getPdfPageCount (pdfBytes) {
	const src = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
	return src.getPageCount()
}

async function callVisionOnPdf (openai, pdfBytes, promptText) {
	const base64 = Buffer.from(pdfBytes).toString('base64')

	const response = await openai.responses.create({
		model: VISION_MODEL,
		max_output_tokens: 16000,
		instructions: SYSTEM_PROMPT,
		input: [
			{
				role: 'user',
				content: [
					{ type: 'input_text', text: promptText },
					{
						type: 'input_file',
						filename: 'chapter.pdf',
						file_data: `data:application/pdf;base64,${base64}`,
					},
				],
			},
		],
	})

	return parseJsonOutput(response.output_text)
}

function mergePageLessons (pageResults, fallbackTitle) {
	const merged = {
		mainTitle: fallbackTitle || 'Chapter lesson',
		unitTheme: '',
		heroSubtitle: '',
		objectivesText: '',
		content: [],
	}

	for (const page of pageResults) {
		const lesson = sanitizeLesson(page, fallbackTitle)
		if (lesson.mainTitle && lesson.mainTitle !== 'Chapter lesson') {
			merged.mainTitle = lesson.mainTitle
		}
		if (lesson.unitTheme) {
			merged.unitTheme = lesson.unitTheme
		}
		if (lesson.heroSubtitle) {
			merged.heroSubtitle = lesson.heroSubtitle
		}
		if (lesson.objectivesText) {
			merged.objectivesText = lesson.objectivesText
		}
		merged.content.push(...lesson.content)
	}

	return sanitizeLesson(merged, fallbackTitle)
}

async function extractLessonPageByPage (openai, pdfBytes, fallbackTitle) {
	const totalPages = await getPdfPageCount(pdfBytes)
	const pageResults = []

	for (let page = 1; page <= totalPages; page += 1) {
		const pageBytes = await extractPdfPageRange(pdfBytes, page, page)
		const prompt = buildPagePrompt(fallbackTitle, page, totalPages)
		const parsed = await callVisionOnPdf(openai, pageBytes, prompt)
		pageResults.push(parsed)
	}

	return mergePageLessons(pageResults, fallbackTitle)
}

async function extractLessonSinglePass (openai, pdfBytes, fallbackTitle) {
	const parsed = await callVisionOnPdf(
		openai,
		pdfBytes,
		buildUserPrompt(fallbackTitle),
	)
	return sanitizeLesson(parsed, fallbackTitle)
}

/**
 * Run the chapter PDF through an OpenAI vision model and return a structured
 * lesson that matches the shape produced by parseChapterPdfText.
 */
async function extractLessonFromPdfWithVision (pdfBytes, options = {}) {
	const { fallbackTitle = '' } = options
	const openai = getClient()

	if (!openai) {
		throw new Error('OPENAI_API_KEY is not configured')
	}

	const buffer = Buffer.isBuffer(pdfBytes) ? pdfBytes : Buffer.from(pdfBytes)
	if (!buffer || buffer.length === 0) {
		throw new Error('PDF buffer is empty')
	}
	if (buffer.length > MAX_PDF_BYTES) {
		throw new Error('Chapter PDF is too large for the vision pass')
	}

	const lesson = PAGE_BY_PAGE
		? await extractLessonPageByPage(openai, buffer, fallbackTitle)
		: await extractLessonSinglePass(openai, buffer, fallbackTitle)

	if (lesson.content.length === 0) {
		throw new Error('Vision pass produced no usable content')
	}

	return lesson
}

export {
	extractLessonFromPdfWithVision,
	isVisionEnabled,
	sanitizeLesson,
}
