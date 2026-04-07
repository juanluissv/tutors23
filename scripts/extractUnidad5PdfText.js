import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PDFParse } from 'pdf-parse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pdfDir = join(root, 'frontend', 'public', 'valores-partes', 'unidad5')
const outDir = join(root, 'scripts', '_extracted-unidad5')

mkdirSync(outDir, { recursive: true })

const files = [
    'unidad5Semana1.pdf',
	'unidad5Semana2.pdf',
	'unidad5Semana3.pdf',
	'unidad5Semana4.pdf',
	'unidad5Semana5.pdf',
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
