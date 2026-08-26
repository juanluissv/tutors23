import OpenAI from 'openai'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import ffmpegPath from 'ffmpeg-static'

const TTS_MODEL = 'gpt-4o-mini-tts'
const DEFAULT_VOICE = 'marin'
const MAX_CHUNK_CHARS = 3800
const DEFAULT_INSTRUCTIONS = 'Habla en español claro y natural, '
	+ 'como un narrador educativo para estudiantes de secundaria. '
	+ 'Usa un ritmo pausado y entonación amigable.'

function getOpenAIClient () {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured')
	}
	return new OpenAI({ apiKey })
}

function splitTextForTts (text) {
	const trimmed = String(text ?? '').trim()
	if (!trimmed) {
		return []
	}
	if (trimmed.length <= MAX_CHUNK_CHARS) {
		return [trimmed]
	}

	const chunks = []
	let remaining = trimmed

	while (remaining.length > MAX_CHUNK_CHARS) {
		let cut = remaining.lastIndexOf('. ', MAX_CHUNK_CHARS)
		if (cut < MAX_CHUNK_CHARS * 0.5) {
			cut = remaining.lastIndexOf(' ', MAX_CHUNK_CHARS)
		}
		if (cut <= 0) {
			cut = MAX_CHUNK_CHARS
		}

		const sliceEnd = remaining[cut] === '.' ? cut + 1 : cut
		const piece = remaining.slice(0, sliceEnd).trim()
		if (piece) {
			chunks.push(piece)
		}
		remaining = remaining.slice(sliceEnd).trim()
	}

	if (remaining) {
		chunks.push(remaining)
	}

	return chunks
}

async function synthesizeChunk (client, text, voice, instructions) {
	const response = await client.audio.speech.create({
		model: TTS_MODEL,
		voice,
		input: text,
		response_format: 'mp3',
		instructions,
	})

	return Buffer.from(await response.arrayBuffer())
}

function runFfmpegConcat (listPath, outPath) {
	return new Promise((resolve, reject) => {
		if (!ffmpegPath) {
			reject(new Error('ffmpeg is required to concatenate long TTS audio'))
			return
		}

		const proc = spawn(ffmpegPath, [
			'-y',
			'-f', 'concat',
			'-safe', '0',
			'-i', listPath,
			'-c', 'copy',
			outPath,
		])

		let stderr = ''
		proc.stderr.on('data', (chunk) => {
			stderr += String(chunk)
		})

		proc.on('error', reject)
		proc.on('close', (code) => {
			if (code === 0) {
				resolve()
				return
			}
			reject(new Error(
				`ffmpeg concat failed (${code}): ${stderr.slice(-500)}`,
			))
		})
	})
}

async function concatMp3Buffers (buffers) {
	if (!Array.isArray(buffers) || buffers.length === 0) {
		throw new Error('No audio buffers to concatenate')
	}
	if (buffers.length === 1) {
		return buffers[0]
	}

	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-tts-'))
	try {
		const partPaths = []
		for (let i = 0; i < buffers.length; i++) {
			const partPath = path.join(tmpDir, `part-${i}.mp3`)
			await fs.writeFile(partPath, buffers[i])
			partPaths.push(partPath)
		}

		const listPath = path.join(tmpDir, 'concat.txt')
		const listContent = partPaths
			.map((partPath) => `file '${partPath.replace(/'/g, '\'\\\'\'')}'`)
			.join('\n')
		await fs.writeFile(listPath, listContent)

		const outPath = path.join(tmpDir, 'output.mp3')
		await runFfmpegConcat(listPath, outPath)
		return await fs.readFile(outPath)
	} finally {
		await fs.rm(tmpDir, { recursive: true, force: true })
	}
}

function parseFfmpegDurationSeconds (stderr) {
	const match = String(stderr ?? '').match(
		/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/,
	)
	if (!match) {
		return null
	}

	const hours = Number(match[1])
	const minutes = Number(match[2])
	const seconds = Number(match[3])
	if (
		!Number.isFinite(hours)
		|| !Number.isFinite(minutes)
		|| !Number.isFinite(seconds)
	) {
		return null
	}

	return hours * 3600 + minutes * 60 + seconds
}

async function probeMp3DurationSeconds (audioBuffer) {
	if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
		throw new Error('Audio buffer is required to probe duration')
	}
	if (!ffmpegPath) {
		throw new Error('ffmpeg is required to probe audio duration')
	}

	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-tts-probe-'))
	const inputPath = path.join(tmpDir, 'input.mp3')

	try {
		await fs.writeFile(inputPath, audioBuffer)

		const duration = await new Promise((resolve, reject) => {
			const proc = spawn(ffmpegPath, ['-i', inputPath])
			let stderr = ''

			proc.stderr.on('data', (chunk) => {
				stderr += String(chunk)
			})
			proc.on('error', reject)
			proc.on('close', () => {
				const parsed = parseFfmpegDurationSeconds(stderr)
				if (parsed == null || parsed <= 0) {
					reject(new Error('Could not read MP3 duration with ffmpeg'))
					return
				}
				resolve(parsed)
			})
		})

		return Math.round(duration * 100) / 100
	} finally {
		await fs.rm(tmpDir, { recursive: true, force: true })
	}
}

async function generateVideoTts (text, options = {}) {
	const narration = String(text ?? '').trim()
	if (!narration) {
		throw new Error('Narration text is required for TTS')
	}

	const voice = options.voice || DEFAULT_VOICE
	const instructions = options.instructions || DEFAULT_INSTRUCTIONS
	const chunks = splitTextForTts(narration)
	const client = getOpenAIClient()
	const buffers = []

	for (const chunk of chunks) {
		buffers.push(await synthesizeChunk(client, chunk, voice, instructions))
	}

	return concatMp3Buffers(buffers)
}

export {
	generateVideoTts,
	probeMp3DurationSeconds,
	DEFAULT_VOICE,
	TTS_MODEL,
	DEFAULT_INSTRUCTIONS,
}
