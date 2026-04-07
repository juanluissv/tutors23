import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PDFDocument } from 'pdf-lib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'frontend', 'public')
const sourcePath = join(publicDir, 'valores.pdf')
const indexPath = join(publicDir, 'valores-index.txt')
const outDir = join(publicDir, 'valores-partes')

/**
 * PDF pages before the first printed book page (e.g. one unnumbered cover).
 * Viewer page (1-based) = número en índice + este valor.
 */
const PRINTED_TO_PHYSICAL_OFFSET = 1

/**
 * Parse valores-index.txt into ordered entries with 1-based start pages.
 */
function parseIndex (text) {
	let unidad = 0
	const entries = []
	for (const line of text.split('\n')) {
		const uMatch = line.match(/^Unidad (\d+)\./)
		if (uMatch) {
			unidad = Number(uMatch[1])
			continue
		}
		const sMatch = line.match(/^Semana (\d+):[\s\S]*?página (\d+)/)
		if (sMatch) {
			entries.push({
				unidad,
				kind: 'semana',
				semana: Number(sMatch[1]),
				startPage: Number(sMatch[2]),
			})
			continue
		}
		const pMatch = line.match(/^Proyecto:[\s\S]*?página (\d+)/)
		if (pMatch) {
			entries.push({
				unidad,
				kind: 'proyecto',
				startPage: Number(pMatch[1]),
			})
		}
	}
	return entries
}

function outfileName (e) {
	if (e.kind === 'proyecto') {
		return `unidad${e.unidad}Proyecto.pdf`
	}
	return `unidad${e.unidad}Semana${e.semana}.pdf`
}

function main () {
	const indexText = readFileSync(indexPath, 'utf8')
	const entries = parseIndex(indexText)
	if (entries.length === 0) {
		console.error('No entries parsed from valores-index.txt')
		process.exit(1)
	}

	const pdfBytes = readFileSync(sourcePath)

	return (async () => {
		const src = await PDFDocument.load(pdfBytes)
		const totalPages = src.getPageCount()

		const off = PRINTED_TO_PHYSICAL_OFFSET
		for (let i = 0; i < entries.length; i++) {
			const e = entries[i]
			const start = e.startPage + off
			const end =
				i + 1 < entries.length
					? entries[i + 1].startPage + off - 1
					: totalPages
			if (start < 1 || end < start || end > totalPages) {
				console.error(
					`Bad range for ${outfileName(e)}: PDF pages ${start}-${end} ` +
						`(printed ${e.startPage}-…, doc has ${totalPages} pages)`,
				)
				process.exit(1)
			}
			const indices = []
			for (let p = start; p <= end; p++) {
				indices.push(p - 1)
			}
			const out = await PDFDocument.create()
			const copied = await out.copyPages(src, indices)
			for (const page of copied) {
				out.addPage(page)
			}
			const outBytes = await out.save()
			mkdirSync(outDir, { recursive: true })
			const path = join(outDir, outfileName(e))
			writeFileSync(path, outBytes)
			console.log(
				`${outfileName(e)}  →  PDF ${start}-${end} ` +
					`(índice impreso ${e.startPage}-…) ${indices.length} pág.`,
			)
		}
		console.log(`Done. ${entries.length} files in ${outDir}`)
	})()
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
