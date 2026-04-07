import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PDFParse } from 'pdf-parse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pdfDir = join(root, 'frontend', 'public', 'valores-partes', 'unidad4')
const outDir = join(root, 'scripts', '_extracted-unidad4')

mkdirSync(outDir, { recursive: true })

const files = [
	'unidad4Semana2.pdf',
	'unidad4Semana3.pdf',
	'unidad4Semana4.pdf',
	'unidad4Semana5.pdf',
	'unidad4Semana6.pdf',
]

for (const name of files) {
	const buf = readFileSync(join(pdfDir, name))
	const parser = new PDFParse({ data: buf })
	const { text } = await parser.getText()
	await parser.destroy()
	const base = name.replace('.pdf', '')
	writeFileSync(join(outDir, `${base}.txt`), text, 'utf8')
	console.log(base, 'chars:', text.length)
}
