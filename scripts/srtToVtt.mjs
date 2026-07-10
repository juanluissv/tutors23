#!/usr/bin/env node
/**
 * Convert an .srt caption file to .vtt (WebVTT).
 *
 * Usage:
 *   node scripts/srtToVtt.mjs input.srt
 *   node scripts/srtToVtt.mjs input.srt output.vtt
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertSrtToVtt } from '../src/utils/srtToVtt.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function usage () {
	console.error('Usage: node scripts/srtToVtt.mjs <input.srt> [output.vtt]')
	process.exit(1)
}

const inputPath = process.argv[2]
if (!inputPath) {
	usage()
}

const resolvedInput = path.resolve(process.cwd(), inputPath)
if (!fs.existsSync(resolvedInput)) {
	console.error(`Input file not found: ${resolvedInput}`)
	process.exit(1)
}

const defaultOutput = resolvedInput.replace(/\.srt$/i, '') + '.vtt'
const outputPath = process.argv[3]
	? path.resolve(process.cwd(), process.argv[3])
	: defaultOutput

try {
	const srt = fs.readFileSync(resolvedInput)
	const vtt = convertSrtToVtt(srt)
	fs.writeFileSync(outputPath, vtt, 'utf8')
	console.log(`Wrote ${outputPath}`)
} catch (err) {
	console.error(err?.message || err)
	process.exit(1)
}
