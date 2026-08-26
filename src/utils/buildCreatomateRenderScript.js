/**
 * Builds Creatomate RenderScript from lesson videoScript + narration audio URL.
 * Visual language mirrors the student web lesson (.lesson-doc):
 * forest greens, sky cover, paper sheets, Georgia + Inter typography.
 */

import { retimeScenesToAudioDuration } from './retimeVideoScriptToAudio.js'

const WIDTH = 1280
const HEIGHT = 720
const RENDER_SCALE = 1

/** Tokens from StudentLessonPageScreen.css (.lesson-doc) */
const COLORS = {
	green900: '#1b4332',
	green800: '#245741',
	green700: '#2d6a4f',
	green600: '#40916c',
	green500: '#52b788',
	green300: '#95d5b2',
	green100: '#d8f3dc',
	sky900: '#0c4a6e',
	sky800: '#075985',
	sky700: '#0369a1',
	sky600: '#0284c7',
	sky500: '#0ea5e9',
	sky400: '#38bdf8',
	sky100: '#e0f2fe',
	amber500: '#d9a441',
	amber100: '#f7ecd2',
	teal700: '#1d6f76',
	tealBg: '#f1f8f8',
	ink900: '#1f2a24',
	ink700: '#3c4a42',
	ink500: '#61736a',
	paper: '#ffffff',
	paperSoft: '#f8fbf9',
	paperEdge: '#e7efe9',
	pageBg: '#f1f5f9',
	skySoft: '#f4f9fd',
	white: '#ffffff',
	// aliases kept for callers that import COLORS
	yellow: '#d9a441',
	teal: '#1d6f76',
	red: '#b9842c',
	blue: '#0369a1',
	black: '#1f2a24',
}

const FONT_DISPLAY = 'Georgia'
const FONT_UI = 'Inter'

const CHART_BAR_COLORS = [
	COLORS.green600,
	COLORS.sky600,
	COLORS.amber500,
	COLORS.teal700,
	COLORS.green500,
	COLORS.sky500,
]

/**
 * Per-scene surface: cover (sky) vs paper sheet (lesson pages).
 */
const SCENE_THEME = {
	title: {
		bg: COLORS.sky800,
		accent: COLORS.sky400,
		headline: COLORS.white,
		body: COLORS.sky100,
		eyebrow: 'rgba(224,242,254,0.9)',
		label: 'Portada',
		surface: 'cover',
	},
	objectives: {
		bg: COLORS.sky700,
		accent: COLORS.sky400,
		headline: COLORS.white,
		body: COLORS.sky100,
		eyebrow: 'rgba(224,242,254,0.9)',
		label: 'Objetivos',
		surface: 'cover',
	},
	concept: {
		bg: COLORS.paper,
		accent: COLORS.green500,
		headline: COLORS.green800,
		body: COLORS.ink700,
		eyebrow: COLORS.green700,
		label: 'Concepto',
		surface: 'paper',
	},
	definition: {
		bg: COLORS.paperSoft,
		accent: COLORS.amber500,
		headline: COLORS.green900,
		body: COLORS.ink700,
		eyebrow: COLORS.green700,
		label: 'Definición',
		surface: 'paper',
	},
	chart: {
		bg: COLORS.paper,
		accent: COLORS.sky600,
		headline: COLORS.green800,
		body: COLORS.ink700,
		eyebrow: COLORS.green700,
		label: 'Datos',
		surface: 'paper',
	},
	map: {
		bg: COLORS.skySoft,
		accent: COLORS.sky600,
		headline: COLORS.sky900,
		body: COLORS.ink700,
		eyebrow: COLORS.sky700,
		label: 'Mapa',
		surface: 'paper',
	},
	bulletList: {
		bg: COLORS.paperSoft,
		accent: COLORS.green500,
		headline: COLORS.green800,
		body: COLORS.ink700,
		eyebrow: COLORS.green700,
		label: 'Glosario',
		surface: 'paper',
	},
	regional: {
		bg: COLORS.tealBg,
		accent: COLORS.teal700,
		headline: COLORS.green900,
		body: COLORS.ink700,
		eyebrow: COLORS.teal700,
		label: 'Regiones',
		surface: 'paper',
	},
	summary: {
		bg: COLORS.paper,
		accent: COLORS.green600,
		headline: COLORS.green800,
		body: COLORS.ink700,
		eyebrow: COLORS.green700,
		label: 'Resumen',
		surface: 'paper',
	},
	outro: {
		bg: COLORS.green800,
		accent: COLORS.green500,
		headline: COLORS.white,
		body: COLORS.green100,
		eyebrow: COLORS.green300,
		label: 'Cierre',
		surface: 'cover',
	},
}

function getTheme (sceneType) {
	return SCENE_THEME[sceneType] || SCENE_THEME.concept
}

function truncateText (text, maxLen = 320) {
	const trimmed = String(text ?? '').trim()
	if (trimmed.length <= maxLen) {
		return trimmed
	}
	return `${trimmed.slice(0, maxLen - 1).trim()}…`
}

function buildTextElement ({
	track,
	time = 0,
	text,
	y = '50%',
	x = '50%',
	width = '88%',
	height = '20%',
	fontFamily = FONT_UI,
	fontWeight = '700',
	fontSize = null,
	fillColor = null,
	lineHeight = '115%',
	xAlignment = '50%',
	yAlignment = '50%',
	letterSpacing = null,
	animations = null,
}) {
	const element = {
		type: 'text',
		track,
		time,
		x,
		y,
		width,
		height,
		x_alignment: xAlignment,
		y_alignment: yAlignment,
		text: String(text ?? '').trim() || ' ',
		font_family: fontFamily,
		font_weight: fontWeight,
		line_height: lineHeight,
		text_wrap: true,
	}
	if (fillColor) {
		element.fill_color = fillColor
	}
	if (fontSize) {
		element.font_size = fontSize
	}
	if (letterSpacing != null) {
		element.letter_spacing = letterSpacing
	}
	if (animations) {
		element.animations = animations
	}
	return element
}

function fadeIn (delay = 0, duration = 0.45) {
	return [
		{
			time: delay,
			duration,
			easing: 'quadratic-out',
			type: 'fade',
		},
	]
}

function defaultTitleAnimation () {
	return [
		{
			time: 0,
			duration: 0.55,
			easing: 'quadratic-out',
			type: 'scale',
			track: 0,
			x_anchor: '50%',
			y_anchor: '50%',
			start_scale: '96%',
			end_scale: '100%',
		},
		{
			time: 0,
			duration: 0.45,
			easing: 'quadratic-out',
			type: 'fade',
		},
	]
}

function kenBurnsAnimation (durationSeconds) {
	const duration = Math.max(4, Number(durationSeconds) || 12)
	return [
		{
			time: 0,
			duration: Math.min(duration, duration - 0.2),
			easing: 'linear',
			type: 'scale',
			scope: 'element',
			start_scale: '100%',
			end_scale: '106%',
			x_anchor: '50%',
			y_anchor: '50%',
		},
		{
			time: 0,
			duration: 0.55,
			easing: 'quadratic-out',
			type: 'fade',
		},
	]
}

/** Left accent bar like .lesson-doc__sheet::before / .lesson-doc__h2::before */
function buildAccentBar (theme, track = 10) {
	return {
		type: 'shape',
		track,
		time: 0,
		x: '0%',
		y: '50%',
		width: '0.7%',
		height: '100%',
		x_anchor: '0%',
		y_anchor: '50%',
		path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
		fill_color: theme.accent,
	}
}

/** Soft top wash for paper scenes (page atmosphere) */
function buildPaperWash (track = 11) {
	return {
		type: 'shape',
		track,
		time: 0,
		x: '50%',
		y: '0%',
		width: '100%',
		height: '28%',
		x_anchor: '50%',
		y_anchor: '0%',
		path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
		fill_color: 'rgba(241,245,249,0.55)',
	}
}

/** Cover radial highlight (sky glow) */
function buildCoverGlow (track = 11) {
	return {
		type: 'shape',
		track,
		time: 0,
		x: '88%',
		y: '8%',
		width: '55%',
		height: '70%',
		x_anchor: '50%',
		y_anchor: '50%',
		path: 'M 50 0 C 77 0 100 23 100 50 C 100 77 77 100 50 100 '
			+ 'C 23 100 0 77 0 50 C 0 23 23 0 50 0 Z',
		fill_color: 'rgba(56,189,248,0.22)',
	}
}

function buildEyebrow (theme, track = 1) {
	const elements = []
	elements.push({
		type: 'shape',
		track,
		time: 0.15,
		x: '8.5%',
		y: '9.5%',
		width: '1.1%',
		height: '1.8%',
		x_anchor: '50%',
		y_anchor: '50%',
		path: 'M 50 0 C 77 0 100 23 100 50 C 100 77 77 100 50 100 '
			+ 'C 23 100 0 77 0 50 C 0 23 23 0 50 0 Z',
		fill_color: theme.accent,
		animations: fadeIn(0.1),
	})
	elements.push(
		buildTextElement({
			track: track + 1,
			time: 0.2,
			text: String(theme.label || '').toUpperCase(),
			x: '54%',
			y: '9.5%',
			width: '78%',
			height: '5%',
			fontFamily: FONT_UI,
			fontWeight: '700',
			fontSize: '18 px',
			fillColor: theme.eyebrow,
			xAlignment: '0%',
			yAlignment: '50%',
			letterSpacing: '12%',
			animations: fadeIn(0.15),
		}),
	)
	return elements
}

function buildIllustrationElement (url, durationSeconds, track = 4) {
	return {
		type: 'image',
		track,
		time: 0.2,
		source: url,
		y: '48%',
		width: '70%',
		height: '54%',
		fit: 'contain',
		border_radius: '18 px',
		animations: kenBurnsAnimation(durationSeconds),
	}
}

function buildShortLabels (scene, maxItems = 3) {
	const labels = []

	if (scene.type === 'definition') {
		const term = String(scene.term ?? '').trim()
		const def = String(scene.definition ?? '').trim()
		if (term) {
			labels.push(term)
		}
		if (def) {
			labels.push(truncateText(def, 72))
		}
		return labels.slice(0, maxItems)
	}

	if (Array.isArray(scene.items) && scene.items.length > 0) {
		for (const item of scene.items) {
			const t = String(item?.title ?? item?.label ?? '').trim()
			const b = String(item?.body ?? item?.value ?? '').trim()
			if (t && b) {
				labels.push(truncateText(`${t}: ${b}`, 56))
			} else if (t || b) {
				labels.push(truncateText(t || b, 56))
			}
			if (labels.length >= maxItems) {
				break
			}
		}
		return labels
	}

	if (
		(scene.type === 'map' || scene.type === 'regional')
		&& Array.isArray(scene.regions)
	) {
		return scene.regions
			.map((r) => String(r ?? '').trim())
			.filter(Boolean)
			.slice(0, maxItems)
	}

	if (scene.type === 'chart' && Array.isArray(scene.data)) {
		return scene.data
			.map((d) => {
				const label = String(d?.label ?? '').trim()
				const val = Number(d?.value)
				if (!label) {
					return ''
				}
				return Number.isFinite(val) ? `${label} ${val}%` : label
			})
			.filter(Boolean)
			.slice(0, maxItems)
	}

	const subtitle = String(scene.subtitle ?? '').trim()
	if (subtitle) {
		return [truncateText(subtitle, 72)]
	}

	return []
}

function buildChartElements (data, theme) {
	const points = Array.isArray(data) ? data.filter(Boolean) : []
	if (points.length === 0) {
		return []
	}

	const maxVal = Math.max(
		...points.map((p) => Number(p.value) || 0),
		1,
	)

	const elements = []
	const rowHeight = Math.min(11, 48 / points.length)
	const startY = 28

	points.forEach((point, index) => {
		const label = String(point.label ?? '').trim()
		const value = Number(point.value)
		const valueLabel = Number.isFinite(value) ? `${value}%` : ''
		const yBase = startY + index * rowHeight
		const barWidthPct = Number.isFinite(value)
			? Math.max(10, (value / maxVal) * 48)
			: 10

		elements.push(
			buildTextElement({
				track: 20 + index * 2,
				time: 0.25 + index * 0.08,
				text: `${label}  ${valueLabel}`.trim(),
				x: '28%',
				y: `${yBase}%`,
				width: '40%',
				height: `${rowHeight - 1.5}%`,
				fontFamily: FONT_UI,
				fontWeight: '600',
				fillColor: theme.body,
				xAlignment: '100%',
				yAlignment: '50%',
				animations: fadeIn(0.2 + index * 0.08),
			}),
		)

		elements.push({
			type: 'shape',
			track: 21 + index * 2,
			time: 0.35 + index * 0.08,
			x: '52%',
			y: `${yBase + rowHeight * 0.35}%`,
			width: `${barWidthPct}%`,
			height: `${Math.max(2.8, rowHeight * 0.38)}%`,
			x_anchor: '0%',
			y_anchor: '50%',
			path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
			fill_color: CHART_BAR_COLORS[index % CHART_BAR_COLORS.length],
			border_radius: '6 px',
			animations: fadeIn(0.3 + index * 0.08),
		})
	})

	return elements
}

function buildListBodyText (scene) {
	if (scene.type === 'definition') {
		const term = String(scene.term ?? '').trim()
		const def = String(scene.definition ?? '').trim()
		if (term && def) {
			return `${term}\n${def}`
		}
		return def || term
	}

	if (scene.type === 'bulletList' && scene.items?.length) {
		return scene.items
			.map((item) => {
				const t = String(item?.title ?? item?.label ?? '').trim()
				const b = String(item?.body ?? item?.value ?? '').trim()
				if (t && b) {
					return `• ${t}: ${b}`
				}
				return t ? `• ${t}` : b ? `• ${b}` : ''
			})
			.filter(Boolean)
			.join('\n')
	}

	if (
		(scene.type === 'map' || scene.type === 'regional')
		&& scene.regions?.length
	) {
		return scene.regions.map((r) => `• ${r}`).join('\n')
	}

	if (scene.type === 'chart' && scene.data?.length) {
		return scene.data
			.map((d) => {
				const label = String(d?.label ?? '').trim()
				const val = Number(d?.value)
				return Number.isFinite(val)
					? `${label}: ${val}%`
					: label
			})
			.filter(Boolean)
			.join('\n')
	}

	return truncateText(scene.narration, 400)
}

function sceneChrome (theme) {
	const elements = [buildAccentBar(theme, 12)]
	if (theme.surface === 'cover') {
		elements.push(buildCoverGlow(11))
	} else {
		elements.push(buildPaperWash(11))
	}
	elements.push(...buildEyebrow(theme, 1))
	return elements
}

function sceneElementsWithIllustration (scene, theme) {
	const headline = String(scene.title ?? '').trim() || 'Lección'
	const illustrationUrl = String(scene.illustrationUrl ?? '').trim()
	const durationSeconds = Math.max(
		0.5,
		Number(scene.durationSeconds) || 15,
	)
	const elements = [
		...sceneChrome(theme),
		buildTextElement({
			track: 3,
			time: 0.25,
			text: headline,
			y: '18%',
			width: '84%',
			height: '12%',
			fontFamily: FONT_DISPLAY,
			fontWeight: '700',
			fillColor: theme.headline,
			animations: defaultTitleAnimation(),
		}),
		buildIllustrationElement(illustrationUrl, durationSeconds, 4),
	]

	const labels = buildShortLabels(scene, 3)
	if (labels.length > 0) {
		elements.push(
			buildTextElement({
				track: 5,
				time: 0.55,
				text: labels.map((label) => `• ${label}`).join('\n'),
				y: '88%',
				width: '84%',
				height: '14%',
				fontFamily: FONT_UI,
				fontWeight: '600',
				fillColor: theme.body,
				lineHeight: '125%',
				yAlignment: '50%',
				animations: fadeIn(0.4),
			}),
		)
	}

	return elements
}

function sceneElementsTextOnly (scene, theme) {
	const headline = String(scene.title ?? '').trim() || 'Lección'
	const subtitle = String(scene.subtitle ?? '').trim()
	const elements = [...sceneChrome(theme)]

	if (scene.type === 'title') {
		elements.push(
			buildTextElement({
				track: 3,
				time: 0.35,
				text: headline,
				y: subtitle ? '42%' : '48%',
				width: '82%',
				height: '22%',
				fontFamily: FONT_DISPLAY,
				fontWeight: '700',
				fillColor: theme.headline,
				animations: defaultTitleAnimation(),
			}),
		)
		if (subtitle) {
			elements.push(
				buildTextElement({
					track: 4,
					time: 0.65,
					text: subtitle,
					y: '62%',
					width: '72%',
					height: '14%',
					fontFamily: FONT_UI,
					fontWeight: '500',
					fillColor: theme.body,
					lineHeight: '130%',
					animations: fadeIn(0.45),
				}),
			)
		}
		return elements
	}

	if (scene.type === 'objectives') {
		elements.push(
			buildTextElement({
				track: 3,
				time: 0.3,
				text: headline,
				y: '22%',
				width: '82%',
				height: '14%',
				fontFamily: FONT_DISPLAY,
				fontWeight: '700',
				fillColor: theme.headline,
				animations: defaultTitleAnimation(),
			}),
		)
		const body = buildListBodyText(scene)
		if (body) {
			elements.push(
				buildTextElement({
					track: 4,
					time: 0.5,
					text: truncateText(body, 420),
					y: '58%',
					width: '78%',
					height: '48%',
					fontFamily: FONT_UI,
					fontWeight: '500',
					fillColor: theme.body,
					lineHeight: '135%',
					yAlignment: '50%',
					animations: fadeIn(0.35),
				}),
			)
		}
		return elements
	}

	elements.push(
		buildTextElement({
			track: 3,
			time: 0.25,
			text: headline,
			y: '20%',
			width: '82%',
			height: '14%',
			fontFamily: FONT_DISPLAY,
			fontWeight: '700',
			fillColor: theme.headline,
			animations: defaultTitleAnimation(),
		}),
	)

	const body = buildListBodyText(scene)
	if (body && scene.type !== 'chart') {
		elements.push(
			buildTextElement({
				track: 4,
				time: 0.45,
				text: truncateText(body, 480),
				y: '58%',
				width: '82%',
				height: '52%',
				fontFamily: FONT_UI,
				fontWeight: scene.type === 'definition' ? '600' : '500',
				fillColor: theme.body,
				lineHeight: '130%',
				yAlignment: '50%',
				animations: fadeIn(0.3),
			}),
		)
	}

	if (scene.type === 'chart' && scene.data?.length) {
		elements.push(...buildChartElements(scene.data, theme))
	}

	return elements
}

function sceneElements (scene) {
	const theme = getTheme(scene.type)
	const illustrationUrl = String(scene.illustrationUrl ?? '').trim()
	if (illustrationUrl) {
		return sceneElementsWithIllustration(scene, theme)
	}
	return sceneElementsTextOnly(scene, theme)
}

function buildSceneComposition (scene, time, index) {
	const theme = getTheme(scene.type)
	const duration = Math.max(0.5, Number(scene.durationSeconds) || 15)

	const composition = {
		type: 'composition',
		track: 1,
		time,
		duration,
		fill_color: theme.bg,
		clip: true,
		elements: sceneElements(scene),
	}

	if (index > 0) {
		composition.animations = [
			{
				time: 0,
				duration: 0.7,
				transition: true,
				type: 'fade',
			},
		]
	}

	return composition
}

function normalizeScenes (videoScript) {
	const raw = Array.isArray(videoScript?.scenes) ? videoScript.scenes : []
	return raw
		.map((scene, index) => {
			const durationRaw = Number(scene?.durationSeconds)
			const durationSeconds = Number.isFinite(durationRaw) && durationRaw > 0
				? Math.round(durationRaw)
				: 15
			const title = String(scene?.title ?? '').trim()
			if (!title && !scene?.narration) {
				return null
			}
			const illustrationUrl = String(scene?.illustrationUrl ?? '').trim()
				|| ''
			return {
				type: String(scene?.type ?? 'concept').trim(),
				title: title || `Escena ${index + 1}`,
				subtitle: String(scene?.subtitle ?? '').trim(),
				narration: String(scene?.narration ?? '').trim(),
				durationSeconds,
				term: String(scene?.term ?? '').trim(),
				definition: String(scene?.definition ?? '').trim(),
				items: Array.isArray(scene?.items) ? scene.items : [],
				data: Array.isArray(scene?.data) ? scene.data : [],
				regions: Array.isArray(scene?.regions) ? scene.regions : [],
				illustrationUrl,
				visualNotes: String(scene?.visualNotes ?? '').trim(),
			}
		})
		.filter(Boolean)
}

function buildCreatomateRenderScript (videoScript, audioUrl) {
	let scenes = normalizeScenes(videoScript)
	if (scenes.length === 0) {
		throw new Error('Video script has no scenes to render')
	}

	const narrationUrl = String(audioUrl ?? '').trim()
	if (!narrationUrl) {
		throw new Error('Narration audio URL is required for video render')
	}

	const audioDurationRaw = Number(videoScript?.audioDurationSeconds)
	if (Number.isFinite(audioDurationRaw) && audioDurationRaw > 0) {
		const sceneSum = scenes.reduce(
			(total, scene) => total + scene.durationSeconds,
			0,
		)
		if (Math.abs(sceneSum - audioDurationRaw) > 0.5) {
			scenes = retimeScenesToAudioDuration(scenes, audioDurationRaw)
		}
	}

	let cursor = 0
	const compositions = scenes.map((scene, index) => {
		const comp = buildSceneComposition(scene, cursor, index)
		cursor += comp.duration
		return comp
	})

	const totalDuration = Number.isFinite(audioDurationRaw) && audioDurationRaw > 0
		? Math.round(audioDurationRaw * 100) / 100
		: cursor

	const elements = [
		{
			type: 'audio',
			track: 2,
			time: 0,
			duration: totalDuration,
			source: narrationUrl,
		},
		...compositions,
	]

	return {
		output_format: 'mp4',
		width: WIDTH,
		height: HEIGHT,
		duration: totalDuration,
		render_scale: RENDER_SCALE,
		fill_color: COLORS.pageBg,
		elements,
	}
}

export {
	buildCreatomateRenderScript,
	COLORS,
	SCENE_THEME,
	WIDTH,
	HEIGHT,
	RENDER_SCALE,
}
