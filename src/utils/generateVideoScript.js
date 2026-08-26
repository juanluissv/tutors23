import OpenAI from 'openai'
import { splitText } from './ingestion.js'
import {
	extractBlockText,
	extractBookLessonText,
} from './extractBookLessonText.js'

const TARGET_SCENE_MIN = 12
const TARGET_SCENE_MAX = 18
const TARGET_DURATION_MIN = 300
const TARGET_DURATION_MAX = 480
const MAP_CONCURRENCY = 2
const CHUNK_SIZE = 2500
const CHUNK_OVERLAP = 250
const MAX_REDUCE_CHARS = 48000
const SINGLE_PASS_MAX_CHARS = 28000
const MAP_CHUNK_RETRIES = 2

const SCENE_TYPES = [
	'title',
	'objectives',
	'concept',
	'definition',
	'chart',
	'map',
	'bulletList',
	'regional',
	'summary',
	'outro',
]

const SKIPPED_BLOCK_TYPES = new Set(['activity', 'phase'])
const STOP_PHASES = new Set(['consolidación', 'consolidacion'])

const VIDEO_SCRIPT_SYSTEM_PROMPT = `Eres un guionista educativo experto en videos explicativos
animados para estudiantes de secundaria en El Salvador.

Recibirás un briefing estructurado de la lección con metadatos, contenido de
Profundización, gráficos, glosario, mapas, documentos y secciones regionales.

Tu tarea: crear un guion de video completo, preciso y listo para TTS + animación.

REGLAS DE CONTENIDO:
- Responde en español
- Usa SOLO información del briefing; no inventes cifras, regiones ni definiciones
- NO incluyas actividades del libro (Exploración, Actividad en pares, Consolidación)
- Cada escena debe tener "narration" con 2–4 oraciones, conversacional y apta para locución
- durationSeconds realista: title/outro 10–15s, definition 15–20s, chart/map 20–30s,
  concept/regional 25–35s, bulletList 25–35s, objectives 20–25s, summary 20–25s
- Genera entre 12 y 18 escenas
- Duración total objetivo: 5 a 8 minutos (300–480 segundos)
- fullNarration DEBE ser exactamente las narraciones de scenes unidas con un espacio

ESTRUCTURA OBLIGATORIA (en este orden lógico):
1. type "title" — título del video
2. type "objectives" — SI hay objectivesText en el briefing
3. type "concept" — importancia general de los bosques / tema central
4. type "concept" — características clave del tema (biodiversidad, clima, datos clave)
5. type "chart" — POR CADA gráfico del briefing; copia data exacta del briefing
6. type "bulletList" — SI hay glosario con 3+ términos: una escena con items
   [{ "title": "término", "body": "definición" }] para TODOS los términos del glosario
   (alternativa: varias escenas type "definition", una por término)
7. type "chart" — segundo gráfico o estadísticas de documentos (ej. agricultura 52.3% / 37.5%)
8. type "map" — SI hay mapas en el briefing; usa regions del briefing
9. type "regional" — UNA escena por cada sección regional del briefing
   (ej. América del Sur, Centro de África, Sudeste asiático)
10. type "summary" — síntesis de causas, impactos y conservación
11. type "outro" — cierre motivador

TIPOS DE ESCENA: title, objectives, concept, definition, chart, map, bulletList,
regional, summary, outro

CAMPOS POR TIPO:
- chart: data = [{ "label": "...", "value": 45 }] con valores numéricos exactos
- definition: term + definition
- bulletList: items = [{ "title": "...", "body": "..." }]
- map / regional: regions = ["Amazonía", "..."]
- Todas: title, narration, durationSeconds, visualNotes

JSON de salida:
{
  "title": "...",
  "language": "es",
  "fullNarration": "...",
  "estimatedDurationSeconds": 0,
  "scenes": [ ... ]
}`

const MAP_SYSTEM_PROMPT = `Eres un guionista educativo. Del fragmento de lección y briefing
que recibes, genera entre 2 y 4 escenas parciales para un video explicativo animado.

Reglas:
- Usa SOLO información del fragmento y briefing
- No incluyas actividades del libro
- Si el fragmento solo contiene actividades, devuelve { "scenes": [] }
- Cada escena DEBE tener "narration" (2–4 oraciones en español)
- Prioriza: chart (con data numérica), definition, bulletList, map, regional, concept
- Copia cifras y regiones exactamente como aparecen en el texto
- Devuelve JSON: { "scenes": [ ... ] }`

const REDUCE_SYSTEM_PROMPT = `Eres un guionista educativo. Combina escenas parciales en un
guion final coherente para toda la lección.

Reglas:
- Genera entre 12 y 18 escenas con flujo narrativo pedagógico
- Orden: title → objectives (si aplica) → conceptos → charts → problemáticas
  (bulletList o definitions) → map → regionales (una por región) → summary → outro
- NO elimines escenas regional, chart, map ni bulletList con datos únicos
- Elimina solo duplicados exactos
- Renumera sceneNumber desde 1
- fullNarration = narraciones de scenes unidas con espacio (sin texto extra)
- estimatedDurationSeconds = suma de durationSeconds
- Usa SOLO información de las escenas parciales y el briefing
- Responde en español
- Devuelve JSON: title, language, fullNarration, estimatedDurationSeconds, scenes`

const REFINE_SYSTEM_PROMPT = `Eres un guionista educativo. Recibes un guion de video con
carencias de cobertura. Complétalo y mejóralo SIN eliminar escenas buenas existentes.

Reglas:
- Mantén escenas existentes que sean correctas; agrega o reemplaza solo lo faltante
- Cubre TODOS los elementos faltantes indicados en el mensaje del usuario
- Usa SOLO información del briefing; no inventes datos
- Entre 12 y 18 escenas totales; duración total 300–480 segundos
- fullNarration = narraciones de scenes unidas con espacio
- Responde en español
- Devuelve JSON completo: title, language, fullNarration, estimatedDurationSeconds, scenes`

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured')
	}
	return new OpenAI({ apiKey })
}

function normalizePhaseName (text) {
	return String(text ?? '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
}

function parseChartData (block) {
	const items = Array.isArray(block?.items) ? block.items : []
	return items
		.map((item) => {
			const label = String(item?.label ?? item?.title ?? '').trim()
			const rawValue = item?.value ?? item?.text
			const value = typeof rawValue === 'number'
				? rawValue
				: Number.parseFloat(String(rawValue ?? '').replace(',', '.'))
			if (!label || Number.isNaN(value)) {
				return null
			}
			return { label, value }
		})
		.filter(Boolean)
}

function parseGlossaryTerms (block) {
	const items = Array.isArray(block?.items) ? block.items : []
	return items
		.map((item) => {
			const term = String(item?.title ?? item?.label ?? '').trim()
			const definition = String(item?.body ?? item?.text ?? '').trim()
			if (!term || !definition) {
				return null
			}
			return { term, definition }
		})
		.filter(Boolean)
}

function parseMapRegions (block) {
	const items = Array.isArray(block?.items) ? block.items : []
	return items
		.map((item) => String(item?.title ?? item?.label ?? item?.text ?? '').trim())
		.filter(Boolean)
}

function extractProfundizacionBlocks (lesson) {
	const content = Array.isArray(lesson?.content) ? lesson.content : []
	const blocks = []
	let inProfundizacion = false

	for (const block of content) {
		const type = String(block?.type ?? '').trim()

		if (type === 'phase') {
			const phaseName = normalizePhaseName(block?.text)
			if (phaseName === 'profundizacion') {
				inProfundizacion = true
				continue
			}
			if (inProfundizacion && STOP_PHASES.has(phaseName)) {
				break
			}
			continue
		}

		if (!inProfundizacion || SKIPPED_BLOCK_TYPES.has(type)) {
			continue
		}

		blocks.push(block)
	}

	return blocks
}

function parsePercentagesFromText (text) {
	const matches = [...String(text).matchAll(
		/el\s+(\d+(?:\.\d+)?)\s*%/gi,
	)]
	return matches
		.map((match) => {
			const value = Number.parseFloat(match[1])
			if (Number.isNaN(value)) {
				return null
			}
			return { raw: match[0], value }
		})
		.filter(Boolean)
}

function inferChartsFromDocs (docs) {
	const inferred = []

	for (const doc of docs) {
		const percentages = parsePercentagesFromText(doc.text)
		if (percentages.length < 2) {
			continue
		}

		const data = []
		const cultivoMatch = doc.text.match(
			/(\d+(?:\.\d+)?)\s*%[^.]*tierras de cultivo/i,
		)
		const pastoreoMatch = doc.text.match(
			/(\d+(?:\.\d+)?)\s*%[^.]*tierras de pastoreo/i,
		)

		if (cultivoMatch) {
			data.push({
				label: 'Ampliación de tierras de cultivo',
				value: Number.parseFloat(cultivoMatch[1]),
			})
		}
		if (pastoreoMatch) {
			data.push({
				label: 'Ampliación de tierras de pastoreo',
				value: Number.parseFloat(pastoreoMatch[1]),
			})
		}

		if (data.length >= 2) {
			inferred.push({
				title: doc.title || `Doc. ${doc.docNumber}`,
				chartKind: 'bar',
				unit: '%',
				data,
				source: `doc-${doc.docNumber || 'inferred'}`,
			})
		}
	}

	return inferred
}

function buildVideoScriptBrief (lesson) {
	const profundizacionBlocks = extractProfundizacionBlocks(lesson)
	const charts = []
	const glossaryTerms = []
	const maps = []
	const docs = []
	const regionalSections = []
	const keyFacts = []

	let currentRegion = null

	for (const block of profundizacionBlocks) {
		const type = String(block?.type ?? '').trim()
		const text = String(block?.text ?? '').trim()

		if (type === 'chart') {
			const data = parseChartData(block)
			if (data.length > 0) {
				charts.push({
					title: text || 'Gráfico',
					chartKind: block?.meta?.chartKind || 'chart',
					unit: block?.meta?.unit || '',
					data,
				})
			}
			continue
		}

		if (type === 'glossary') {
			glossaryTerms.push(...parseGlossaryTerms(block))
			continue
		}

		if (type === 'map') {
			const regions = parseMapRegions(block)
			if (regions.length > 0) {
				maps.push({
					title: text || 'Mapa',
					regions,
				})
			}
			continue
		}

		if (type === 'doc') {
			const docText = extractBlockText(block).join('\n')
			docs.push({
				docNumber: block?.meta?.docNumber
					? String(block.meta.docNumber)
					: '',
				title: text,
				text: docText,
			})
			continue
		}

		if (type === 'h3' || type === 'h4') {
			currentRegion = text
			regionalSections.push({
				region: text,
				text: '',
			})
			continue
		}

		if (currentRegion && (type === 'p' || type === 'info')) {
			const section = regionalSections[regionalSections.length - 1]
			const lines = extractBlockText(block)
			const joined = lines.join('\n')
			section.text = section.text
				? `${section.text}\n\n${joined}`
				: joined
			continue
		}

		if (type === 'info' && text.toLowerCase().includes('conexión')) {
			const lines = extractBlockText(block)
			keyFacts.push({
				label: text,
				text: lines.join(' '),
			})
			continue
		}

		if (type === 'p' || type === 'h2' || type === 'info') {
			const lines = extractBlockText(block)
			if (lines.length > 0) {
				keyFacts.push({
					label: text || type,
					text: lines.join(' '),
				})
			}
		}
	}

	const inferredCharts = inferChartsFromDocs(docs)
	for (const chart of inferredCharts) {
		const exists = charts.some((item) => (
			item.data.length === chart.data.length
			&& item.data.every((point, index) => (
				point.label === chart.data[index]?.label
				&& point.value === chart.data[index]?.value
			))
		))
		if (!exists) {
			charts.push(chart)
		}
	}

	const profundizacionText = profundizacionBlocks
		.flatMap((block) => extractBlockText(block))
		.join('\n\n')

	const requiredElements = [
		{ type: 'title', label: 'Escena de título' },
	]

	if (lesson?.objectivesText) {
		requiredElements.push({
			type: 'objectives',
			label: 'Objetivos de aprendizaje',
		})
	}

	requiredElements.push(
		{ type: 'concept', label: 'Conceptos clave del tema' },
	)

	for (const chart of charts) {
		requiredElements.push({
			type: 'chart',
			label: `Gráfico: ${chart.title}`,
		})
	}

	if (glossaryTerms.length >= 3) {
		requiredElements.push({
			type: 'bulletList',
			label: `Glosario (${glossaryTerms.length} términos)`,
		})
	} else if (glossaryTerms.length > 0) {
		for (const term of glossaryTerms) {
			requiredElements.push({
				type: 'definition',
				label: `Definición: ${term.term}`,
			})
		}
	}

	for (const map of maps) {
		requiredElements.push({
			type: 'map',
			label: `Mapa: ${map.title}`,
		})
	}

	for (const section of regionalSections) {
		requiredElements.push({
			type: 'regional',
			label: `Región: ${section.region}`,
		})
	}

	requiredElements.push(
		{ type: 'summary', label: 'Resumen' },
		{ type: 'outro', label: 'Cierre' },
	)

	return {
		mainTitle: lesson?.mainTitle || '',
		unitTheme: lesson?.unitTheme || '',
		heroSubtitle: lesson?.heroSubtitle || '',
		objectivesText: lesson?.objectivesText || '',
		profundizacionText,
		charts,
		glossaryTerms,
		maps,
		docs,
		regionalSections,
		keyFacts,
		requiredElements,
	}
}

function formatBriefForPrompt (brief) {
	return JSON.stringify(brief, null, 2)
}

function normalizeDataPoint (item) {
	const label = String(item?.label ?? '').trim()
	const rawValue = item?.value
	const value = typeof rawValue === 'number'
		? rawValue
		: Number.parseFloat(String(rawValue ?? '').replace(',', '.'))

	if (!label || Number.isNaN(value)) {
		return null
	}

	return { label, value }
}

function normalizeSceneItem (item) {
	if (!item || typeof item !== 'object') {
		return null
	}

	const normalized = {
		title: String(item?.title ?? '').trim(),
		body: String(item?.body ?? '').trim(),
		label: String(item?.label ?? '').trim(),
		value: String(item?.value ?? '').trim(),
	}

	const hasContent = Object.values(normalized).some(Boolean)
	return hasContent ? normalized : null
}

function extractScenesArray (parsed) {
	if (Array.isArray(parsed?.scenes)) {
		return parsed.scenes
	}
	if (Array.isArray(parsed?.escenas)) {
		return parsed.escenas
	}
	if (Array.isArray(parsed?.partialScenes)) {
		return parsed.partialScenes
	}
	if (Array.isArray(parsed)) {
		return parsed
	}
	return []
}

function extractSceneNarration (scene) {
	const directCandidates = [
		scene?.narration,
		scene?.narracion,
		scene?.voiceover,
		scene?.locucion,
		scene?.texto,
		scene?.script,
		scene?.text,
	]

	for (const candidate of directCandidates) {
		const trimmed = String(candidate ?? '').trim()
		if (trimmed) {
			return trimmed
		}
	}

	const fallbackParts = [
		scene?.title,
		scene?.subtitle,
		scene?.definition,
		scene?.term,
	].filter((part) => part != null && String(part).trim() !== '')

	if (fallbackParts.length > 0) {
		return fallbackParts.map((part) => String(part).trim()).join('. ')
	}

	if (Array.isArray(scene?.items) && scene.items.length > 0) {
		return scene.items
			.map((item) => {
				const title = String(item?.title ?? item?.label ?? '').trim()
				const body = String(item?.body ?? item?.text ?? '').trim()
				if (title && body) {
					return `${title}: ${body}`
				}
				return title || body
			})
			.filter(Boolean)
			.join('. ')
	}

	return ''
}

function normalizeScene (scene, index) {
	const type = String(scene?.type ?? scene?.tipo ?? 'concept').trim()
	const safeType = SCENE_TYPES.includes(type) ? type : 'concept'

	const data = Array.isArray(scene?.data)
		? scene.data.map(normalizeDataPoint).filter(Boolean)
		: []

	const items = Array.isArray(scene?.items)
		? scene.items.map(normalizeSceneItem).filter(Boolean)
		: []

	const regions = Array.isArray(scene?.regions)
		? scene.regions
			.map((region) => String(region ?? '').trim())
			.filter(Boolean)
		: Array.isArray(scene?.regiones)
			? scene.regiones
				.map((region) => String(region ?? '').trim())
				.filter(Boolean)
			: []

	const durationRaw = Number(scene?.durationSeconds ?? scene?.duracion)
	const durationSeconds = Number.isFinite(durationRaw) && durationRaw > 0
		? Math.round(durationRaw)
		: 20

	const narration = extractSceneNarration(scene)
	if (!narration) {
		return null
	}

	return {
		sceneNumber: index + 1,
		type: safeType,
		title: String(scene?.title ?? scene?.titulo ?? '').trim(),
		subtitle: String(scene?.subtitle ?? scene?.subtitulo ?? '').trim(),
		narration,
		durationSeconds,
		visualNotes: String(
			scene?.visualNotes ?? scene?.notasVisuales ?? '',
		).trim(),
		term: String(scene?.term ?? scene?.termino ?? '').trim(),
		definition: String(scene?.definition ?? scene?.definicion ?? '').trim(),
		items,
		data,
		regions,
	}
}

function finalizeVideoScript (videoScript, fallbackTitle = '') {
	let scenes = Array.isArray(videoScript?.scenes)
		? videoScript.scenes
			.map((scene, index) => normalizeScene(scene, index))
			.filter(Boolean)
		: []

	if (scenes.length > TARGET_SCENE_MAX) {
		scenes = scenes.slice(0, TARGET_SCENE_MAX)
	}

	scenes = scenes.map((scene, index) => ({
		...scene,
		sceneNumber: index + 1,
	}))

	const fullNarration = scenes.map((scene) => scene.narration).join(' ')
	const estimatedDurationSeconds = scenes.reduce(
		(total, scene) => total + scene.durationSeconds,
		0,
	)

	return {
		title: String(videoScript?.title ?? fallbackTitle).trim() || fallbackTitle,
		language: String(videoScript?.language ?? 'es').trim() || 'es',
		fullNarration,
		estimatedDurationSeconds,
		scenes,
		generatedAt: new Date(),
	}
}

function normalizeVideoScript (parsed, fallbackTitle = '') {
	const scenesRaw = extractScenesArray(parsed)
	const scenes = scenesRaw
		.map((scene, index) => normalizeScene(scene, index))
		.filter(Boolean)

	return finalizeVideoScript(
		{
			title: parsed?.title,
			language: parsed?.language,
			scenes,
		},
		fallbackTitle,
	)
}

function analyzeScriptCoverage (videoScript, brief) {
	const scenes = Array.isArray(videoScript?.scenes) ? videoScript.scenes : []
	const sceneTypes = scenes.map((scene) => scene.type)
	const gaps = []

	if (!sceneTypes.includes('title')) {
		gaps.push('Falta escena type "title"')
	}

	if (brief.objectivesText && !sceneTypes.includes('objectives')) {
		gaps.push('Falta escena type "objectives" con los objetivos del briefing')
	}

	const conceptCount = sceneTypes.filter((type) => type === 'concept').length
	if (conceptCount < 2) {
		gaps.push('Faltan escenas type "concept" (se necesitan al menos 2)')
	}

	const chartCount = sceneTypes.filter((type) => type === 'chart').length
	if (brief.charts.length > 0 && chartCount < brief.charts.length) {
		gaps.push(
			`Faltan escenas type "chart" (hay ${brief.charts.length} gráficos `
			+ `en el briefing, solo ${chartCount} en el guion)`,
		)
	}

	if (brief.glossaryTerms.length >= 3) {
		const hasBulletList = sceneTypes.includes('bulletList')
		const definitionCount = sceneTypes.filter(
			(type) => type === 'definition',
		).length
		if (!hasBulletList && definitionCount < brief.glossaryTerms.length) {
			gaps.push(
				`Falta escena type "bulletList" con los ${brief.glossaryTerms.length} `
				+ 'términos del glosario, o escenas definition para cada término',
			)
		}
	}

	if (brief.maps.length > 0 && !sceneTypes.includes('map')) {
		gaps.push('Falta escena type "map" con las regions del briefing')
	}

	const regionalCount = sceneTypes.filter((type) => type === 'regional').length
	if (
		brief.regionalSections.length > 0
		&& regionalCount < brief.regionalSections.length
	) {
		gaps.push(
			`Faltan escenas type "regional" (hay ${brief.regionalSections.length} `
			+ `secciones regionales, solo ${regionalCount} escenas)`,
		)
	}

	if (!sceneTypes.includes('summary')) {
		gaps.push('Falta escena type "summary"')
	}

	if (!sceneTypes.includes('outro')) {
		gaps.push('Falta escena type "outro"')
	}

	if (scenes.length < TARGET_SCENE_MIN) {
		gaps.push(
			`Solo hay ${scenes.length} escenas; se necesitan al menos `
			+ `${TARGET_SCENE_MIN}`,
		)
	}

	if (videoScript.estimatedDurationSeconds < TARGET_DURATION_MIN) {
		gaps.push(
			`Duración estimada ${videoScript.estimatedDurationSeconds}s; `
			+ `objetivo mínimo ${TARGET_DURATION_MIN}s (5 min). `
			+ 'Alarga narraciones o agrega escenas concept/regional.',
		)
	}

	return gaps
}

async function callJsonLlm (client, systemPrompt, userPrompt) {
	const response = await client.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0.3,
		response_format: { type: 'json_object' },
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
	})

	const raw = response.choices[0]?.message?.content || '{}'
	return JSON.parse(raw)
}

async function runWithConcurrency (items, worker, concurrency) {
	const results = []

	for (let i = 0; i < items.length; i += concurrency) {
		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(
			batch.map((item, batchIndex) => worker(item, i + batchIndex)),
		)
		results.push(...batchResults)
	}

	return results
}

function formatScenesForReduce (scenes) {
	return scenes
		.map((scene) => {
			const extras = []
			if (scene.data?.length) {
				extras.push(`Data: ${JSON.stringify(scene.data)}`)
			}
			if (scene.regions?.length) {
				extras.push(`Regions: ${scene.regions.join(', ')}`)
			}
			if (scene.items?.length) {
				extras.push(`Items: ${JSON.stringify(scene.items)}`)
			}
			return (
				`#${scene.sceneNumber} [${scene.type}] ${scene.title || '(sin título)'}\n`
				+ `Narración: ${scene.narration}\n`
				+ `Duración: ${scene.durationSeconds}s`
				+ (extras.length ? `\n${extras.join('\n')}` : '')
			)
		})
		.join('\n\n')
}

function buildUserPrompt (brief, bodyText) {
	return (
		'BRIEFING ESTRUCTURADO DE LA LECCIÓN:\n'
		+ `${formatBriefForPrompt(brief)}\n\n`
		+ 'TEXTO DE PROFUNDIZACIÓN:\n'
		+ `${bodyText}`
	)
}

async function mapChunk (client, brief, chunk, index, total) {
	const userPrompt = (
		`${buildUserPrompt(brief, chunk)}\n\n`
		+ `Fragmento ${index + 1} de ${total}.`
	)

	for (let attempt = 0; attempt <= MAP_CHUNK_RETRIES; attempt += 1) {
		const parsed = await callJsonLlm(client, MAP_SYSTEM_PROMPT, userPrompt)
		const partial = normalizeVideoScript(parsed)
		if (partial.scenes.length > 0) {
			return partial.scenes
		}
	}

	return []
}

async function generateFromMapReduce (client, brief, text, fallbackTitle) {
	const chunks = splitText(text, CHUNK_SIZE, CHUNK_OVERLAP)
	const partialLists = await runWithConcurrency(
		chunks,
		(chunk, index) => mapChunk(client, brief, chunk, index, chunks.length),
		MAP_CONCURRENCY,
	)

	let partialScenes = partialLists.flat()
	if (partialScenes.length === 0) {
		console.warn(
			'Map phase returned no scenes; falling back to single-pass generation',
		)
		return generateFromSinglePass(client, brief, text, fallbackTitle)
	}

	partialScenes = partialScenes.map((scene, index) => ({
		...scene,
		sceneNumber: index + 1,
	}))

	partialScenes = await collapseSceneLists(client, brief, partialScenes)
	const reduced = await reduceScenes(client, brief, partialScenes, fallbackTitle)

	if (reduced.scenes.length === 0) {
		console.warn(
			'Reduce phase returned no scenes; falling back to single-pass generation',
		)
		return generateFromSinglePass(client, brief, text, fallbackTitle)
	}

	return reduced
}

async function collapseSceneLists (client, brief, scenes) {
	const formatted = formatScenesForReduce(scenes)
	if (formatted.length <= MAX_REDUCE_CHARS) {
		return scenes
	}

	const midpoint = Math.ceil(scenes.length / 2)
	const firstHalf = scenes.slice(0, midpoint)
	const secondHalf = scenes.slice(midpoint)

	const collapsed = await Promise.all([
		collapseSceneLists(client, brief, firstHalf),
		collapseSceneLists(client, brief, secondHalf),
	])

	return collapsed.flat()
}

async function reduceScenes (client, brief, partialScenes, fallbackTitle) {
	const formatted = formatScenesForReduce(partialScenes)
	const userPrompt = (
		`${buildUserPrompt(brief, brief.profundizacionText)}\n\n`
		+ `Escenas parciales:\n\n${formatted}`
	)
	const parsed = await callJsonLlm(client, REDUCE_SYSTEM_PROMPT, userPrompt)
	return normalizeVideoScript(parsed, fallbackTitle)
}

async function generateFromSinglePass (client, brief, text, fallbackTitle) {
	const userPrompt = buildUserPrompt(brief, text)
	const parsed = await callJsonLlm(
		client,
		VIDEO_SCRIPT_SYSTEM_PROMPT,
		userPrompt,
	)
	return normalizeVideoScript(parsed, fallbackTitle)
}

async function refineVideoScript (
	client,
	brief,
	videoScript,
	gaps,
	fallbackTitle,
) {
	const userPrompt = (
		`${buildUserPrompt(brief, brief.profundizacionText)}\n\n`
		+ 'GUION ACTUAL:\n'
		+ `${JSON.stringify(videoScript, null, 2)}\n\n`
		+ 'ELEMENTOS FALTANTES A CORREGIR:\n'
		+ gaps.map((gap, index) => `${index + 1}. ${gap}`).join('\n')
	)
	const parsed = await callJsonLlm(client, REFINE_SYSTEM_PROMPT, userPrompt)
	return normalizeVideoScript(parsed, fallbackTitle)
}

function buildFallbackTitle (lesson) {
	const parts = [
		lesson?.mainTitle,
		lesson?.unitTheme,
	].filter(Boolean)

	return parts.join(' — ') || 'Lección'
}

async function generateVideoScript (lesson) {
	const brief = buildVideoScriptBrief(lesson)
	const text = brief.profundizacionText.trim()
		|| extractBookLessonText(lesson).trim()

	if (text.length < 20) {
		throw new Error('Not enough lesson text to generate a video script')
	}

	const fallbackTitle = buildFallbackTitle(lesson)
	const client = getOpenAIClient()

	let videoScript = text.length <= SINGLE_PASS_MAX_CHARS
		? await generateFromSinglePass(client, brief, text, fallbackTitle)
		: await generateFromMapReduce(client, brief, text, fallbackTitle)

	let gaps = analyzeScriptCoverage(videoScript, brief)
	if (gaps.length > 0) {
		videoScript = await refineVideoScript(
			client,
			brief,
			videoScript,
			gaps,
			fallbackTitle,
		)
		gaps = analyzeScriptCoverage(videoScript, brief)
	}

	if (gaps.length > 0 && videoScript.scenes.length < TARGET_SCENE_MIN) {
		videoScript = await refineVideoScript(
			client,
			brief,
			videoScript,
			gaps,
			fallbackTitle,
		)
	}

	videoScript = finalizeVideoScript(videoScript, fallbackTitle)

	if (videoScript.scenes.length === 0) {
		throw new Error('No video scenes were generated from lesson text')
	}

	return videoScript
}

export {
	TARGET_SCENE_MAX,
	TARGET_SCENE_MIN,
	SCENE_TYPES,
	buildVideoScriptBrief,
	generateVideoScript,
}
