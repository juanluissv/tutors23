import OpenAI from 'openai'

const IMAGE_MODEL = 'gpt-image-1-mini'
const IMAGE_SIZE = '1536x1024'
const IMAGE_QUALITY = 'medium'
const IMAGE_CONTENT_TYPE = 'image/png'

const STYLE_SUFFIX = 'Educational explainer illustration, soft watercolor '
	+ 'style, clean composition, consistent Latin American textbook aesthetic, '
	+ '16:9 landscape, no text, no letters, no logos, no watermarks, '
	+ 'no captions, no UI chrome.'

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured')
	}
	return new OpenAI({ apiKey })
}

function sceneTypeHint (type) {
	const t = String(type ?? '').trim().toLowerCase()
	switch (t) {
		case 'title':
			return 'Opening title slide mood: welcoming educational cover image.'
		case 'objectives':
			return 'Learning goals mood: clear path, study plan, curiosity.'
		case 'definition':
			return 'Concept definition mood: focused symbol that explains one idea.'
		case 'chart':
			return 'Infographic mood: simple visual metaphor for data or proportions.'
		case 'map':
			return 'Simplified illustrated map of regions, soft colors, no labels.'
		case 'regional':
			return 'Geographic regions mood: stylized continents or biomes.'
		case 'bulletList':
			return 'Glossary or list mood: related icons arranged neatly.'
		case 'summary':
			return 'Summary mood: key takeaways as a calm visual recap.'
		case 'outro':
			return 'Closing mood: hopeful, actionable, community care.'
		case 'concept':
		default:
			return 'Concept explanation mood: clear visual metaphor for the topic.'
	}
}

function buildSceneImagePrompt (scene) {
	const title = String(scene?.title ?? '').trim() || 'Educational scene'
	const visualNotes = String(scene?.visualNotes ?? '').trim()
	const narration = String(scene?.narration ?? '').trim()
	const type = String(scene?.type ?? 'concept').trim()
	const regions = Array.isArray(scene?.regions)
		? scene.regions.map((r) => String(r ?? '').trim()).filter(Boolean)
		: []
	const chartLabels = Array.isArray(scene?.data)
		? scene.data
			.map((d) => String(d?.label ?? '').trim())
			.filter(Boolean)
		: []

	const parts = [
		`Scene title: ${title}.`,
		sceneTypeHint(type),
	]

	if (visualNotes) {
		parts.push(`Visual direction: ${visualNotes}.`)
	} else if (narration) {
		parts.push(`Narration context: ${narration.slice(0, 280)}.`)
	}

	if (regions.length > 0) {
		parts.push(`Regions to suggest visually: ${regions.slice(0, 6).join(', ')}.`)
	}

	if (chartLabels.length > 0) {
		parts.push(
			`Data topics to suggest visually: ${chartLabels.slice(0, 6).join(', ')}.`,
		)
	}

	parts.push(STYLE_SUFFIX)
	return parts.join(' ')
}

async function generateOneSceneIllustration (scene, options = {}) {
	const client = options.client || getOpenAIClient()
	const model = options.model || IMAGE_MODEL
	const size = options.size || IMAGE_SIZE
	const quality = options.quality || IMAGE_QUALITY
	const imagePrompt = options.imagePrompt || buildSceneImagePrompt(scene)

	const result = await client.images.generate({
		model,
		prompt: imagePrompt,
		size,
		quality,
	})

	const b64 = result?.data?.[0]?.b64_json
	if (!b64) {
		throw new Error(
			`OpenAI did not return image data for scene ${
				scene?.sceneNumber ?? ''
			}`.trim(),
		)
	}

	return {
		sceneNumber: scene?.sceneNumber,
		imagePrompt,
		buffer: Buffer.from(b64, 'base64'),
		contentType: IMAGE_CONTENT_TYPE,
		model,
		size,
		quality,
	}
}

/**
 * Generate illustrations for video-script scenes.
 * Skips scenes that already have illustrationFileId unless force=true.
 *
 * @param {Array} scenes
 * @param {{ force?: boolean, model?: string, size?: string, quality?: string,
 *   onProgress?: (info: object) => void }} options
 * @returns {Promise<{ generated: Array, skipped: Array }>}
 */
async function generateSceneIllustrations (scenes, options = {}) {
	const list = Array.isArray(scenes) ? scenes : []
	if (list.length === 0) {
		throw new Error('No scenes available for illustration generation')
	}

	const force = Boolean(options.force)
	const client = getOpenAIClient()
	const generated = []
	const skipped = []

	for (let i = 0; i < list.length; i++) {
		const scene = list[i]
		const existingId = scene?.illustrationFileId
			&& String(scene.illustrationFileId).trim() !== ''
			? String(scene.illustrationFileId).trim()
			: ''

		if (existingId && !force) {
			skipped.push({
				sceneNumber: scene?.sceneNumber ?? i + 1,
				illustrationFileId: existingId,
				reason: 'already_exists',
			})
			continue
		}

		if (typeof options.onProgress === 'function') {
			options.onProgress({
				index: i,
				total: list.length,
				sceneNumber: scene?.sceneNumber ?? i + 1,
				title: scene?.title || '',
			})
		}

		const result = await generateOneSceneIllustration(scene, {
			...options,
			client,
		})
		generated.push({
			...result,
			sceneIndex: i,
			sceneNumber: scene?.sceneNumber ?? i + 1,
			previousIllustrationFileId: existingId || undefined,
		})
	}

	return { generated, skipped }
}

export {
	generateSceneIllustrations,
	generateOneSceneIllustration,
	buildSceneImagePrompt,
	IMAGE_MODEL,
	IMAGE_SIZE,
	IMAGE_QUALITY,
	IMAGE_CONTENT_TYPE,
	STYLE_SUFFIX,
}
