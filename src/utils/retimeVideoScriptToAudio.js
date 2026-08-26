const MIN_SCENE_SECONDS = 2

function countNarrationWords (text) {
	return String(text ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.length
}

function roundDuration (seconds) {
	return Math.round(Number(seconds) * 100) / 100
}

/**
 * Redistribute scene durations so they sum to the real narration
 * audio length, weighted by each scene's narration word count.
 */
function retimeScenesToAudioDuration (
	scenes,
	audioDurationSeconds,
	options = {},
) {
	const list = Array.isArray(scenes) ? scenes : []
	const total = Number(audioDurationSeconds)
	const minSceneSeconds = Number.isFinite(Number(options.minSceneSeconds))
		? Math.max(0.5, Number(options.minSceneSeconds))
		: MIN_SCENE_SECONDS

	if (list.length === 0) {
		return []
	}
	if (!Number.isFinite(total) || total <= 0) {
		throw new Error('Valid audio duration is required to retime scenes')
	}

	const weights = list.map((scene) => {
		const words = countNarrationWords(scene?.narration)
		return Math.max(1, words)
	})
	const weightSum = weights.reduce((sum, weight) => sum + weight, 0)

	const floorTotal = minSceneSeconds * list.length
	let durations

	if (floorTotal >= total) {
		const equal = total / list.length
		durations = list.map(() => equal)
	} else {
		const remaining = total - floorTotal
		durations = weights.map(
			(weight) => minSceneSeconds + (weight / weightSum) * remaining,
		)
	}

	durations = durations.map(roundDuration)

	// Fix rounding drift on the longest scene so the sum matches exactly.
	const roundedSum = durations.reduce((sum, value) => sum + value, 0)
	const drift = roundDuration(total - roundedSum)
	if (drift !== 0) {
		let adjustIndex = 0
		for (let i = 1; i < durations.length; i += 1) {
			if (durations[i] > durations[adjustIndex]) {
				adjustIndex = i
			}
		}
		durations[adjustIndex] = roundDuration(
			Math.max(minSceneSeconds, durations[adjustIndex] + drift),
		)
	}

	// Final guard: force exact sum on last scene if tiny float noise remains.
	const finalSum = durations.reduce((sum, value) => sum + value, 0)
	const finalDrift = roundDuration(total - finalSum)
	if (finalDrift !== 0) {
		const lastIndex = durations.length - 1
		durations[lastIndex] = roundDuration(
			Math.max(minSceneSeconds, durations[lastIndex] + finalDrift),
		)
	}

	return list.map((scene, index) => ({
		...scene,
		durationSeconds: durations[index],
	}))
}

/**
 * Mutates a videoScript-like object in place with retimed scenes and
 * duration metadata derived from the real MP3 length.
 */
function applyAudioDurationToVideoScript (videoScript, audioDurationSeconds) {
	if (!videoScript || typeof videoScript !== 'object') {
		throw new Error('videoScript is required')
	}

	const audioDuration = roundDuration(audioDurationSeconds)
	if (!Number.isFinite(audioDuration) || audioDuration <= 0) {
		throw new Error('Valid audio duration is required')
	}

	const scenes = Array.isArray(videoScript.scenes)
		? videoScript.scenes
		: []
	const retimedScenes = retimeScenesToAudioDuration(scenes, audioDuration)

	videoScript.scenes = retimedScenes
	videoScript.estimatedDurationSeconds = audioDuration
	videoScript.audioDurationSeconds = audioDuration

	return videoScript
}

export {
	MIN_SCENE_SECONDS,
	countNarrationWords,
	retimeScenesToAudioDuration,
	applyAudioDurationToVideoScript,
}
