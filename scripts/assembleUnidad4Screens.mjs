import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const screenDir = join(
	__dirname,
	'../frontend/src/screens/9/valores/unidad4',
)
const s1Path = join(screenDir, 'Semana1Unidad4Screen.jsx')
const s1 = readFileSync(s1Path, 'utf8')
const lines = s1.split('\n')
const prefix = lines.slice(0, 180).join('\n')
const videoBlock = lines.slice(190, 279).join('\n')
const suffix = lines.slice(1300).join('\n')
const fragDir = join(__dirname, 'unidad4-fragments')

function writeScreen (num) {
	const fragPath = join(fragDir, `sem${num}.jsx`)
	let body = readFileSync(fragPath, 'utf8')
	if (!body.includes('<<<VIDEO_BLOCK>>>')) {
		throw new Error(`Missing <<<VIDEO_BLOCK>>> in ${fragPath}`)
	}
	body = body.replace('<<<VIDEO_BLOCK>>>', videoBlock)
	let pre = prefix.replaceAll(
		'Semana1Unidad4Screen',
		`Semana${num}Unidad4Screen`,
	)
	pre = pre.replace(
		"'/unidad4Semana1.vtt'",
		`'/unidad4Semana${num}.vtt'`,
	)
	pre = pre.replace("import { Link } from 'react-router-dom'\n", '')
	let suf = suffix.replaceAll(
		'Semana1Unidad4Screen',
		`Semana${num}Unidad4Screen`,
	)
	const out = join(screenDir, `Semana${num}Unidad4Screen.jsx`)
	writeFileSync(out, `${pre}\n${body}\n${suf}`, 'utf8')
	console.log('Wrote', out)
}

const weeks = process.argv[2]
	? process.argv[2].split(',').map(Number)
	: [2, 3, 4, 5, 6]
for (const n of weeks) {
	writeScreen(n)
}
