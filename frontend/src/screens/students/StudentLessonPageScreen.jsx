import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import SuggestedQuestionsPanel, {
	SparklesIcon,
} from '../../components/SuggestedQuestionsPanel'
import { useGetBookLessonByIdQuery } from '../../slices/student/studentApiSlice'
import { useGetBookLessonByIdForSchoolAdminQuery } from '../../slices/admin/schoolAdminApiSlice'
import { useGetBookLessonByIdForTeacherQuery } from '../../slices/teachers/teacherApiSlice'
import '../../App.css'
import './StudentLessonPageScreen.css'

const ACTIVITY_LABELS = {
	individual: 'Actividad individual',
	'en pares': 'Actividad en pares',
	'en equipo': 'Actividad en equipo',
	'con docente': 'Actividad con docente',
}

const ACTIVITY_VARIANT = {
	individual: '',
	'en pares': 'blue',
	'en equipo': 'teal',
	'con docente': 'amber',
}

const CHART_PALETTE = [
	'var(--green-500)',
	'var(--green-900)',
	'var(--amber-500)',
	'var(--green-300)',
	'var(--sky-600)',
	'var(--teal-700)',
]

const LeafIcon = ({ size = 22 }) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden
	>
		<path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z' />
		<path d='M2 21c0-3 1.85-5.36 5.08-6' />
	</svg>
)

function phaseVariant (text) {
	const lower = String(text || '').toLowerCase()
	if (lower.includes('explor')) {
		return 'amber'
	}
	if (lower.includes('consolid')) {
		return 'teal'
	}
	return ''
}

function isShortTitle (text) {
	const trimmed = String(text || '').trim()
	if (!trimmed) {
		return false
	}
	if (/[.!?]$/.test(trimmed)) {
		return false
	}
	return trimmed.split(/\s+/).length <= 9
}

function calloutVariant (label) {
	const lower = String(label || '').toLowerCase()
	return lower.includes('web') ? 'web' : 'geo'
}

function LessonElement ({ element, activityNumber }) {
	const type = element?.type || 'p'
	const text = element?.text ? String(element.text).trim() : ''
	const items = Array.isArray(element?.items) ? element.items : []
	const meta = element?.meta || {}
	const blockId = element?.blockId ? String(element.blockId) : ''
	const blockProps = blockId ? { 'data-block-id': blockId } : {}

	if (!text && items.length === 0) {
		return null
	}

	switch (type) {
	case 'eyebrow':
		return (
			<p className='lesson-doc__section-title' {...blockProps}>
				{text}
			</p>
		)
	case 'h1':
	case 'h2':
		return (
			<h2 className='lesson-doc__h2' {...blockProps}>
				{text}
			</h2>
		)
	case 'h3':
		return (
			<h3 className='lesson-doc__h3' {...blockProps}>
				{text}
			</h3>
		)
	case 'h4':
		return (
			<h4 className='lesson-doc__h4' {...blockProps}>
				{text}
			</h4>
		)
	case 'h5':
		return (
			<h5 className='lesson-doc__h5' {...blockProps}>
				{text}
			</h5>
		)
	case 'objectives':
		return (
			<div className='lesson-doc__callout' {...blockProps}>
				<p className='lesson-doc__callout-kicker'>
					<LeafIcon size={13} />
					{text || 'En esta unidad aprenderemos a:'}
				</p>
				{items.map((item, itemIndex) => (
					<p
						key={`obj-${itemIndex}`}
						className='lesson-doc__callout-text'
					>
						{item.text}
					</p>
				))}
			</div>
		)
	case 'phase': {
		const variant = phaseVariant(text)
		return (
			<div
				{...blockProps}
				className={
					'lesson-doc__phase'
					+ (variant ? ` lesson-doc__phase--${variant}` : '')
				}
			>
				<span className='lesson-doc__phase-icon'>
					<LeafIcon size={16} />
				</span>
				{text}
			</div>
		)
	}
	case 'activity': {
		const activityKind = meta.activityKind || ''
		const variant = ACTIVITY_VARIANT[activityKind] || ''
		const tag = ACTIVITY_LABELS[activityKind] || 'Actividad'
		const titleText = isShortTitle(text) ? text : ''
		const bodyText = titleText ? '' : text

		return (
			<div
				{...blockProps}
				className={
					'lesson-doc__activity'
					+ (variant ? ` lesson-doc__activity--${variant}` : '')
				}
			>
				<div className='lesson-doc__activity-head'>
					<span className='lesson-doc__activity-badge'>
						{meta.activityNumber || activityNumber}
					</span>
					<div>
						<span className='lesson-doc__activity-tag'>{tag}</span>
						{titleText ? (
							<h3 className='lesson-doc__activity-title'>
								{titleText}
							</h3>
						) : null}
					</div>
				</div>
				<div className='lesson-doc__activity-body'>
					{bodyText ? <p>{bodyText}</p> : null}
					{items.length > 0 ? (
						<ul className='lesson-doc__list'>
							{items.map((item, itemIndex) => (
								<li key={`act-${itemIndex}`}>
									{item.label && item.label !== '•' ? (
										<strong>{item.label}. </strong>
									) : null}
									{item.text}
								</li>
							))}
						</ul>
					) : null}
				</div>
			</div>
		)
	}
	case 'doc':
		return (
			<div className='lesson-doc__doc' {...blockProps}>
				<div className='lesson-doc__doc-head'>
					<span className='lesson-doc__doc-chip'>
						{meta.docNumber ? `Doc. ${meta.docNumber}` : 'Doc.'}
					</span>
					{text ? (
						<p className='lesson-doc__doc-title'>{text}</p>
					) : null}
				</div>
				<div className='lesson-doc__doc-body'>
					{items.map((item, itemIndex) => (
						<p
							key={`doc-${itemIndex}`}
							className='lesson-doc__doc-text'
						>
							{item.text}
						</p>
					))}
				</div>
			</div>
		)
	case 'info': {
		const variant = calloutVariant(text)
		return (
			<div
				className={`lesson-doc__callout lesson-doc__callout--${variant}`}
				{...blockProps}
			>
				<p className='lesson-doc__callout-kicker'>
					<LeafIcon size={13} />
					{text}
				</p>
				{items.map((item, itemIndex) => (
					<p
						key={`info-${itemIndex}`}
						className='lesson-doc__callout-text'
					>
						{item.text}
					</p>
				))}
			</div>
		)
	}
	case 'glossary':
		return (
			<div {...blockProps}>
				<p className='lesson-doc__section-title'>
					{text || 'Glosario'}
				</p>
				<div className='lesson-doc__grid'>
					{items.map((item, itemIndex) => (
						<div
							key={`gl-${itemIndex}`}
							className='lesson-doc__term'
						>
							{item.title ? (
								<p className='lesson-doc__term-title'>
									{item.title}
								</p>
							) : null}
							<p className='lesson-doc__term-text'>
								{item.body || item.text}
							</p>
						</div>
					))}
				</div>
			</div>
		)
	case 'profundizacion':
		return (
			<div {...blockProps}>
				<p className='lesson-doc__section-title'>
					{text || 'Profundización'}
				</p>
				<div className='lesson-doc__grid'>
					{items.map((item, itemIndex) => (
						<div
							key={`pf-${itemIndex}`}
							className='lesson-doc__term'
						>
							{item.title ? (
								<p className='lesson-doc__term-title'>
									{item.title}
								</p>
							) : null}
							<p className='lesson-doc__term-text'>
								{item.body || item.text}
							</p>
						</div>
					))}
				</div>
			</div>
		)
	case 'numberedList':
		return (
			<ul className='lesson-doc__numbered' {...blockProps}>
				{items.map((item, itemIndex) => (
					<li
						key={`num-${itemIndex}`}
						className='lesson-doc__numbered-item'
					>
						<span className='lesson-doc__numbered-badge'>
							{item.label}
						</span>
						<span className='lesson-doc__numbered-text'>
							<strong>{item.title}</strong>
							{item.body ? ` ${item.body}` : ''}
						</span>
					</li>
				))}
			</ul>
		)
	case 'bulletList':
		return (
			<ul className='lesson-doc__list' {...blockProps}>
				{items.map((item, itemIndex) => (
					<li key={`bul-${itemIndex}`}>
						{item.title ? (
							<>
								<strong>{item.title}</strong>
								{item.body ? `: ${item.body}` : ''}
							</>
						) : (
							item.body || item.text
						)}
					</li>
				))}
			</ul>
		)
	case 'diagram':
		return (
			<div className='lesson-doc__diagram' {...blockProps}>
				{text ? (
					<div className='lesson-doc__diagram-root'>{text}</div>
				) : null}
				<div className='lesson-doc__diagram-branches'>
					{items.map((item, itemIndex) => (
						<div
							key={`dg-${itemIndex}`}
							className='lesson-doc__diagram-box'
						>
							{item.title ? (
								<p className='lesson-doc__diagram-box-title'>
									{item.title}
								</p>
							) : null}
							{item.body || item.text ? (
								<p className='lesson-doc__diagram-box-text'>
									{item.body || item.text}
								</p>
							) : null}
						</div>
					))}
				</div>
			</div>
		)
	case 'map':
		return (
			<div className='lesson-doc__map' {...blockProps}>
				{text ? (
					<p className='lesson-doc__section-title'>{text}</p>
				) : null}
				<div className='lesson-doc__grid'>
					{items.map((item, itemIndex) => {
						const body = item.body || item.text
						if (!body) {
							return (
								<span
									key={`mp-${itemIndex}`}
									className='lesson-doc__map-label'
								>
									{item.title}
								</span>
							)
						}
						return (
							<div
								key={`mp-${itemIndex}`}
								className='lesson-doc__term'
							>
								{item.title ? (
									<p className='lesson-doc__term-title'>
										{item.title}
									</p>
								) : null}
								<p className='lesson-doc__term-text'>
									{body}
								</p>
							</div>
						)
					})}
				</div>
			</div>
		)
	case 'figure':
		return (
			<div className='lesson-doc__figure' {...blockProps}>
				{text ? (
					<p className='lesson-doc__figure-caption'>{text}</p>
				) : null}
				{items.length > 0 ? (
					<div className='lesson-doc__figure-body'>
						{items.map((item, itemIndex) => (
							<p
								key={`fg-${itemIndex}`}
								className='lesson-doc__figure-text'
							>
								{item.title ? (
									<strong>{item.title}: </strong>
								) : null}
								{item.body || item.text}
							</p>
						))}
					</div>
				) : null}
			</div>
		)
	case 'chips':
		return (
			<div className='lesson-doc__chips' {...blockProps}>
				{items.map((item, itemIndex) => (
					<span key={`chip-${itemIndex}`} className='lesson-doc__chip'>
						{item.text}
					</span>
				))}
			</div>
		)
	case 'table': {
		const headers = Array.isArray(meta.headers) ? meta.headers : []
		const isTemplate = meta.isTemplate === true
		const rows = items.length > 0
			? items
			: (isTemplate && headers.length > 0
				? [{ cells: headers.map(() => '') }]
				: [])

		return (
			<div className='lesson-doc__table-wrap' {...blockProps}>
				{text ? (
					<p className='lesson-doc__table-caption'>{text}</p>
				) : null}
				<table
					className={
						'lesson-doc__table'
						+ (isTemplate ? ' lesson-doc__table--template' : '')
					}
				>
					{headers.length > 0 ? (
						<thead>
							<tr>
								{headers.map((header, headerIndex) => (
									<th key={`th-${headerIndex}`}>{header}</th>
								))}
							</tr>
						</thead>
					) : null}
					<tbody>
						{rows.map((item, rowIndex) => {
							const cells = Array.isArray(item.cells)
								? item.cells
								: []
							return (
								<tr key={`tr-${rowIndex}`}>
									{cells.map((cell, cellIndex) => (
										<td key={`td-${rowIndex}-${cellIndex}`}>
											{cell || (isTemplate ? '\u00a0' : '—')}
										</td>
									))}
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		)
	}
	case 'chart': {
		const slices = items
			.map((item) => ({
				label: item.label || item.text || '',
				value: parseFloat(item.value) || 0,
			}))
			.filter((slice) => slice.value > 0)

		if (slices.length === 0) {
			return null
		}

		const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1
		const unit = meta.unit || '%'
		const isDonut = (meta.chartKind || 'bar') === 'donut'
		const top = slices.reduce(
			(best, slice) => (slice.value > best.value ? slice : best),
			slices[0],
		)

		let cursor = 0
		const gradientStops = slices
			.map((slice, sliceIndex) => {
				const start = (cursor / total) * 100
				cursor += slice.value
				const end = (cursor / total) * 100
				const color = CHART_PALETTE[sliceIndex % CHART_PALETTE.length]
				return `${color} ${start}% ${end}%`
			})
			.join(', ')

		return (
			<div className='lesson-doc__chart' {...blockProps}>
				{isDonut ? (
					<div
						className='lesson-doc__chart-donut'
						style={{
							background: `conic-gradient(${gradientStops})`,
						}}
					>
						<div className='lesson-doc__chart-hole'>
							<strong>
								{top.value}
								{unit}
							</strong>
							<span>{top.label}</span>
						</div>
					</div>
				) : null}
				<div className='lesson-doc__chart-legend'>
					{slices.map((slice, sliceIndex) => (
						<div
							key={`slice-${sliceIndex}`}
							className='lesson-doc__chart-row'
						>
							<span
								className='lesson-doc__chart-swatch'
								style={{
									background:
										CHART_PALETTE[
											sliceIndex % CHART_PALETTE.length
										],
								}}
							/>
							<span className='lesson-doc__chart-name'>
								{slice.label}
							</span>
							{!isDonut ? (
								<span className='lesson-doc__chart-bar'>
									<span
										className='lesson-doc__chart-bar-fill'
										style={{
											width: `${(slice.value / total) * 100}%`,
											background:
												CHART_PALETTE[
													sliceIndex
													% CHART_PALETTE.length
												],
										}}
									/>
								</span>
							) : null}
							<span className='lesson-doc__chart-pct'>
								{slice.value}
								{unit}
							</span>
						</div>
					))}
				</div>
			</div>
		)
	}
	default:
		return (
			<p className='lesson-doc__p' {...blockProps}>
				{text}
			</p>
		)
	}
}

const BLOCK_ID_RE = /^[bh]\d+$/

function parseVTT (vttText) {
	const lines = vttText.split('\n')
	const cues = []
	let i = 0

	while (i < lines.length) {
		const line = lines[i].trim()

		if (line === '' || line === 'WEBVTT' || /^NOTE\b/i.test(line)) {
			i++
			continue
		}

		let blockId = ''
		let timestampLine = line

		if (!line.includes('-->')) {
			if (BLOCK_ID_RE.test(line)) {
				blockId = line
				i++
				if (i >= lines.length) {
					break
				}
				timestampLine = lines[i].trim()
			} else if (/^\d+$/.test(line)) {
				i++
				if (i >= lines.length) {
					break
				}
				timestampLine = lines[i].trim()
			}
		}

		if (!timestampLine.includes('-->')) {
			i++
			continue
		}

		const [startTime, endTime] = timestampLine.split('-->')
			.map((t) => t.trim())
		const start = parseVttTime(startTime)
		const end = parseVttTime(endTime)

		i++
		let text = ''
		while (
			i < lines.length
			&& lines[i].trim() !== ''
			&& !lines[i].includes('-->')
		) {
			const nextLine = lines[i].trim()
			if (!BLOCK_ID_RE.test(nextLine) && !/^\d+$/.test(nextLine)) {
				text += `${nextLine} `
			}
			i++
		}

		cues.push({
			start,
			end,
			text: text.trim(),
			blockId,
		})
	}

	return cues
}

function parseVttTime (timeString) {
	const parts = timeString.split(':')
	if (parts.length === 3) {
		const hours = parseFloat(parts[0])
		const minutes = parseFloat(parts[1])
		const seconds = parseFloat(parts[2])
		return hours * 3600 + minutes * 60 + seconds
	}
	return 0
}

// Lesson elements that can be highlighted while the tutor video plays. We keep
// this list broad so cues that map to headings, activities, callouts, lists,
// glossary terms, etc. can also light up, not just plain paragraphs.
const LESSON_TEXT_SELECTOR = [
	'.lesson-doc__p',
	'.lesson-doc__h2',
	'.lesson-doc__h3',
	'.lesson-doc__h4',
	'.lesson-doc__h5',
	'.lesson-doc__section-title',
	'.lesson-doc__phase',
	'.lesson-doc__callout-kicker',
	'.lesson-doc__callout-text',
	'.lesson-doc__doc-title',
	'.lesson-doc__doc-text',
	'.lesson-doc__activity-title',
	'.lesson-doc__activity-body p',
	'.lesson-doc__list li',
	'.lesson-doc__numbered-text',
	'.lesson-doc__term-title',
	'.lesson-doc__term-text',
	'.lesson-doc__figure-caption',
	'.lesson-doc__figure-text',
	'.lesson-doc__diagram-box-text',
	'.lesson-doc__table-caption',
].join(', ')

// Very common Spanish words that add noise when matching a transcript cue to a
// lesson block. Stripping them makes the overlap score reflect meaningful words.
const MATCH_STOP_WORDS = new Set([
	'de', 'la', 'el', 'en', 'los', 'las', 'un', 'una', 'unos', 'unas',
	'que', 'por', 'con', 'del', 'sus', 'como', 'para', 'mas', 'muy',
	'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'sobre', 'entre',
])

// Lowercase, drop accents/diacritics and punctuation so that transcript text
// (which may differ in punctuation or accents from the generated lesson text)
// still lines up with the rendered content.
function normalizeForMatch (text) {
	return String(text || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function tokenizeForMatch (text) {
	return normalizeForMatch(text)
		.split(' ')
		.filter((word) => word.length > 2 && !MATCH_STOP_WORDS.has(word))
}

// --- Matching tuning knobs -------------------------------------------------
// Weighted share of a cue's distinctive words that must appear in a block for
// it to count as a hit.
const MATCH_SCORE_THRESHOLD = 0.6
// Minimum distinctive "signal" a cue must carry to be placed at all. Cues made
// only of generic, repeated words (e.g. "Actividad en pares") fall below this
// and are intentionally ignored so the highlight doesn't jump around.
const MIN_CUE_SIGNAL = 1.5
// The winning block must beat the runner-up by at least this much weighted
// signal, otherwise the cue is considered ambiguous (repeated text) and skipped.
const MATCH_MARGIN = 0.75
// Small continuity bonus so that, when scores are close, we prefer the block
// nearest to (and ahead of) the one currently highlighted — video plays in
// reading order, it should not leap back to the top of the page.
const POSITION_BONUS_MAX = 0.4
const POSITION_BONUS_SPAN = 6
const LAPTOP_SIDEBAR_EXPAND_BREAKPOINT = 1450

function getInitialSidebarOpen () {
	return window.innerWidth >= LAPTOP_SIDEBAR_EXPAND_BREAKPOINT
}

function StudentLessonPageScreen () {
	const navigate = useNavigate()
	const location = useLocation()
	const { lessonId, subjectId } = useParams()
	const { studentInfo } = useSelector((state) => state.authStudent)
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const isSchoolAdminView = location.pathname.startsWith('/schooladmins/')
	const isTeacherView = location.pathname.startsWith('/teachers/')
	const isStaffView = isSchoolAdminView || isTeacherView
	const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
		getInitialSidebarOpen(),
	)
	const [allCues, setAllCues] = useState([])
	const [videoLoading, setVideoLoading] = useState(true)
	const [isClassVideoPlaying, setIsClassVideoPlaying] = useState(false)
	const [questionText, setQuestionText] = useState('')
	const [isSuggestedPanelOpen, setIsSuggestedPanelOpen] = useState(false)
	const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null)

	const contentRef = useRef(null)
	const classVideoRef = useRef(null)
	const questionTextareaRef = useRef(null)
	// Cached, tokenized snapshot of the highlightable lesson blocks.
	const matchIndexRef = useRef({ entries: [], idf: new Map() })
	// The element currently highlighted and the cue text that produced it,
	// tracked via refs so rapid timeupdate events never race React state.
	const activeElementRef = useRef(null)
	// DOM/reading order of the currently highlighted block, used to bias the
	// next match forward and keep the read-along moving in sequence.
	const activeOrderRef = useRef(-1)
	const lastCueKeyRef = useRef('')

	useEffect(() => {
		if (isSchoolAdminView && !schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
		if (isTeacherView && !teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [isSchoolAdminView, isTeacherView, schoolAdminInfo, teacherInfo, navigate])

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth

			if (width >= LAPTOP_SIDEBAR_EXPAND_BREAKPOINT) {
				setIsSidebarOpen(true)
			} else if (width > 768) {
				setIsSidebarOpen(false)
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const {
		data: studentLesson,
		isLoading: isStudentLoading,
		isError: isStudentError,
		error: studentError,
	} = useGetBookLessonByIdQuery(lessonId, {
		skip: !lessonId || !studentInfo || isStaffView,
	})


	const {
		data: schoolAdminLesson,
		isLoading: isSchoolAdminLoading,
		isError: isSchoolAdminError,
		error: schoolAdminError,
	} = useGetBookLessonByIdForSchoolAdminQuery(
		{ subjectId, lessonId },
		{
			skip: !lessonId || !subjectId || !schoolAdminInfo || !isSchoolAdminView,
		},
	)

	const {
		data: teacherLesson,
		isLoading: isTeacherLoading,
		isError: isTeacherError,
		error: teacherError,
	} = useGetBookLessonByIdForTeacherQuery(
		{ subjectId, lessonId },
		{
			skip: !lessonId || !subjectId || !teacherInfo || !isTeacherView,
		},
	)

	const lesson = isSchoolAdminView
		? schoolAdminLesson
		: (isTeacherView ? teacherLesson : studentLesson)
	const isLoading = isSchoolAdminView
		? isSchoolAdminLoading
		: (isTeacherView ? isTeacherLoading : isStudentLoading)
	const isError = isSchoolAdminView
		? isSchoolAdminError
		: (isTeacherView ? isTeacherError : isStudentError)
	const error = isSchoolAdminView
		? schoolAdminError
		: (isTeacherView ? teacherError : studentError)

	const chapterVideoUrl = lesson?.chapterVideoFileUrl
		? String(lesson.chapterVideoFileUrl).trim()
		: ''
	const hasTutorVideo = chapterVideoUrl !== ''
	const hasTutorTranscribe = Boolean(
		lesson?.chapterTranscribeFileId || lesson?.chapterTranscribeFileUrl,
	)

	const suggestedQuestions = useMemo(() => {
		const items = Array.isArray(lesson?.suggestedQuestions)
			? lesson.suggestedQuestions
			: []

		return items
			.map((item) => ({
				question: String(item?.question ?? '').trim(),
				answer: String(item?.answer ?? '').trim(),
			}))
			.filter((item) => item.question)
	}, [lesson])

	const hasSuggestedQuestions = suggestedQuestions.length > 0

	const chatIndexId = lesson?.chatIndexId
		? String(lesson.chatIndexId).trim()
		: ''

	const openLessonChat = (question) => {
		const trimmedQuestion = String(question ?? '').trim()
		if (!trimmedQuestion) {
			return
		}

		const params = new URLSearchParams()
		params.set('query', trimmedQuestion)

		const chatPath = chatIndexId
			? `/subjects/${encodeURIComponent(chatIndexId)}`
			: '/'

		window.open(`${chatPath}?${params.toString()}`, '_blank')
	}

	const chapterTranscribeUrl = useMemo(() => {
		if (!lessonId || !hasTutorTranscribe) {
			return ''
		}
		if (isSchoolAdminView && subjectId) {
			return `/api/subjects/${subjectId}/book-lessons/${lessonId}/transcribe`
		}
		if (isTeacherView && subjectId) {
			return `/api/subjects/${subjectId}/teacher/book-lessons/${lessonId}/transcribe`
		}
		return `/api/book-lessons/${lessonId}/transcribe`
	}, [lessonId, subjectId, isSchoolAdminView, isTeacherView, hasTutorTranscribe])

	useEffect(() => {
		if (!chapterTranscribeUrl) {
			setAllCues([])
			return
		}

		let cancelled = false

		const loadVTT = async () => {
			try {
				const response = await fetch(chapterTranscribeUrl, {
					credentials: 'include',
				})
				if (!response.ok) {
					throw new Error(`Transcript request failed (${response.status})`)
				}
				const vttText = await response.text()
				const cues = parseVTT(vttText)
				const filteredCues = cues.filter((cue) => (
					!cue.text.includes('TurboScribe')
					&& !cue.text.includes('Go Unlimited')
				))

				if (!cancelled) {
					setAllCues(filteredCues)
				}
			} catch (loadError) {
				console.error('Error loading VTT:', loadError)
				if (!cancelled) {
					setAllCues([])
				}
			}
		}

		loadVTT()

		return () => {
			cancelled = true
		}
	}, [chapterTranscribeUrl])

	// Build a tokenized snapshot of every highlightable lesson block once the
	// content is on screen. Matching against this cached index keeps the
	// per-frame timeupdate work cheap (no repeated DOM reads / normalization).
	const buildMatchIndex = useCallback(() => {
		if (!contentRef.current) {
			matchIndexRef.current = { entries: [], idf: new Map() }
			return
		}

		const blockNodes = contentRef.current.querySelectorAll('[data-block-id]')
		const nodes = blockNodes.length > 0
			? blockNodes
			: contentRef.current.querySelectorAll(LESSON_TEXT_SELECTOR)
		const entries = []
		// Document frequency: how many blocks each token appears in. Words that
		// show up in many blocks (actividad, bosques, tropicales…) are common
		// noise; words in few blocks are distinctive and disambiguate.
		const docFreq = new Map()

		nodes.forEach((element, order) => {
			const tokens = tokenizeForMatch(element.textContent)
			if (tokens.length === 0) {
				return
			}
			const tokenSet = new Set(tokens)
			entries.push({ element, tokenSet, order: entries.length })
			// count each distinct token once per block
			tokenSet.forEach((token) => {
				docFreq.set(token, (docFreq.get(token) || 0) + 1)
			})
		})

		// Inverse document frequency. A token present in every block gets a
		// weight of 0 (log(1)); rarer tokens get progressively higher weight.
		const total = entries.length || 1
		const idf = new Map()
		docFreq.forEach((freq, token) => {
			idf.set(token, Math.log(total / freq))
		})

		matchIndexRef.current = { entries, idf }
	}, [])

	// Rebuild the highlight index whenever the rendered lesson changes. Runs
	// after commit, so contentRef already holds the freshly rendered blocks.
	useEffect(() => {
		buildMatchIndex()
		activeElementRef.current = null
		activeOrderRef.current = -1
		lastCueKeyRef.current = ''
	}, [lesson, buildMatchIndex])

	const applyHighlight = (element, order = -1) => {
		if (!element || element === activeElementRef.current) {
			return
		}

		clearHighlights()
		element.classList.add('karaoke-active')
		element.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		})
		activeElementRef.current = element
		if (order >= 0) {
			activeOrderRef.current = order
		}
	}

	const clearHighlights = () => {
		if (!contentRef.current) {
			return
		}
		const highlighted = contentRef.current.querySelectorAll('.karaoke-active')
		highlighted.forEach((el) => el.classList.remove('karaoke-active'))
	}

	// Find the lesson block that best matches a transcript cue.
	//
	// Robust against three sources of false positives:
	//  1. Weighting  — each cue word contributes its IDF weight, so distinctive
	//     words drive the match and generic/repeated words (actividad, bosques…)
	//     count for almost nothing.
	//  2. Signal gate — a cue must carry enough distinctive weight to be placed
	//     at all; purely generic cues ("Actividad en pares") are skipped.
	//  3. Uniqueness — the winner must clearly beat the runner-up, otherwise the
	//     cue is ambiguous (its text is repeated across the lesson) and skipped.
	// A small forward-position bonus breaks near-ties toward reading order so the
	// highlight advances instead of leaping back up the page.
	const findBestMatch = (cueText) => {
		const index = matchIndexRef.current
		const entries = index?.entries
		const idf = index?.idf
		if (!entries || entries.length === 0) {
			return null
		}

		// Distinct cue tokens + the cue's total distinctive weight.
		const cueTokens = new Set(tokenizeForMatch(cueText))
		if (cueTokens.size === 0) {
			return null
		}

		let cueWeight = 0
		cueTokens.forEach((token) => {
			cueWeight += idf.get(token) || 0
		})

		// The cue is only generic, repeated words → nothing reliable to anchor
		// on. Keep the previous highlight rather than guessing.
		if (cueWeight < MIN_CUE_SIGNAL) {
			return null
		}

		const currentOrder = activeOrderRef.current

		let best = null
		let bestScore = 0
		let secondSignal = 0
		let bestSignal = 0

		for (const entry of entries) {
			let matchedWeight = 0
			cueTokens.forEach((token) => {
				if (entry.tokenSet.has(token)) {
					matchedWeight += idf.get(token) || 0
				}
			})
			if (matchedWeight === 0) {
				continue
			}

			const coverage = matchedWeight / cueWeight

			// Continuity bonus: prefer blocks at or just ahead of the current
			// position; decays with distance and never applies to backward jumps.
			let positionBonus = 0
			if (currentOrder >= 0 && entry.order >= currentOrder) {
				const distance = entry.order - currentOrder
				positionBonus =
					POSITION_BONUS_MAX
					* Math.max(0, 1 - distance / POSITION_BONUS_SPAN)
			}

			const score = coverage + positionBonus

			if (score > bestScore) {
				secondSignal = bestSignal
				bestScore = score
				bestSignal = matchedWeight
				best = entry
			} else if (matchedWeight > secondSignal) {
				secondSignal = matchedWeight
			}
		}

		if (!best) {
			return null
		}

		// Reject weak coverage and ambiguous ties (text repeated elsewhere).
		if (bestScore < MATCH_SCORE_THRESHOLD) {
			return null
		}
		if (bestSignal - secondSignal < MATCH_MARGIN) {
			return null
		}

		return best
	}

	const handleTimeUpdate = (currentTime) => {
		if (allCues.length === 0) {
			return
		}

		const currentCue = allCues.find(
			(cue) => currentTime >= cue.start && currentTime < cue.end,
		)

		// Between cues (or no active cue): keep the last highlight so the
		// read-along doesn't flicker off during natural pauses in narration.
		if (!currentCue) {
			return
		}

		const cueKey = currentCue.blockId
			? `${currentCue.start}:${currentCue.blockId}`
			: `${currentCue.start}:${currentCue.text}`

		if (cueKey === lastCueKeyRef.current) {
			return
		}
		lastCueKeyRef.current = cueKey

		if (currentCue.blockId && contentRef.current) {
			const anchored = contentRef.current.querySelector(
				`[data-block-id="${currentCue.blockId}"]`,
			)
			if (anchored) {
				applyHighlight(anchored)
				return
			}
		}

		const match = findBestMatch(currentCue.text)

		// No confident match for this cue: leave the previous highlight in
		// place rather than clearing it, so the reader always has a cursor.
		if (!match) {
			return
		}

		applyHighlight(match.element, match.order)
	}

	const handleClassVideoToggle = () => {
		if (!classVideoRef.current) {
			return
		}

		if (classVideoRef.current.paused || classVideoRef.current.ended) {
			classVideoRef.current.play()
			setIsClassVideoPlaying(true)
		} else {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}
	}

	const adjustQuestionTextareaHeight = (el) => {
		if (!el) {
			return
		}
		el.style.height = 'auto'
		const minH = 52
		const maxH = 200
		el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`
	}

	const handleQuestionChange = (e) => {
		setQuestionText(e.target.value)
		adjustQuestionTextareaHeight(e.target)
	}

	const handleSendQuestion = () => {
		if (!questionText.trim()) {
			return
		}

		if (classVideoRef.current) {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}

		openLessonChat(questionText.trim())
		setQuestionText('')
		if (questionTextareaRef.current) {
			questionTextareaRef.current.style.height = '52px'
		}
	}

	const handleOpenSuggestedQuestions = () => {
		const lessonSubjectId = String(lesson?.subject?._id ?? '').trim()
		const chapterId = String(lesson?.bookChapter?.chapterId ?? '').trim()

		if (!lessonSubjectId || !chapterId) {
			return
		}

		if (classVideoRef.current) {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}

		const params = new URLSearchParams()
		params.set('subjectId', lessonSubjectId)
		params.set('chapterId', chapterId)
		params.set('questions', '1')
		window.open(`/?${params.toString()}`, '_blank', 'noopener,noreferrer')
	}

	const handleCloseSuggestedPanel = useCallback(() => {
		setIsSuggestedPanelOpen(false)
		setExpandedQuestionIndex(null)
	}, [])

	const handleOpenSuggestedPanel = () => {
		if (classVideoRef.current) {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}

		setExpandedQuestionIndex(null)
		setIsSuggestedPanelOpen(true)
	}

	const handleToggleSuggestedQuestion = (index) => {
		setExpandedQuestionIndex((current) => (
			current === index ? null : index
		))
	}

	useEffect(() => {
		if (!isSuggestedPanelOpen) {
			return undefined
		}

		const scroller = contentRef.current
		const previousOverflow = scroller?.style.overflow || ''
		if (scroller) {
			scroller.style.overflow = 'hidden'
		}

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				handleCloseSuggestedPanel()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			if (scroller) {
				scroller.style.overflow = previousOverflow
			}
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isSuggestedPanelOpen, handleCloseSuggestedPanel])

	// Split the flat element stream into "paper sheets", starting a new sheet
	// at every learning phase (Exploración, Profundización, …) just like the
	// printed textbook.
	const sheets = useMemo(() => {
		const content = Array.isArray(lesson?.content) ? lesson.content : []
		const result = []
		let current = []

		for (const element of content) {
			if (element?.type === 'phase' && current.length > 0) {
				result.push(current)
				current = [element]
			} else {
				current.push(element)
			}
		}

		if (current.length > 0) {
			result.push(current)
		}

		return result
	}, [lesson])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const LayoutSidebar = isSchoolAdminView
		? AdminSidebar
		: (isTeacherView ? TeacherSidebar : Sidebar)
	const LayoutHeader = isSchoolAdminView
		? AdminHeader
		: (isTeacherView ? TeacherHeader : Header)

	if (isSchoolAdminView && !schoolAdminInfo) {
		return null
	}

	if (isTeacherView && !teacherInfo) {
		return null
	}

	const backPath = isSchoolAdminView
		? `/schooladmins/viewbook/${subjectId}`
		: (isTeacherView
			? `/teachers/generatelessons/${subjectId}`
			: (lesson?.subject?._id
				? `/students/viewbook/${lesson.subject._id}`
				: null))

	const renderShell = (children) => (
		<div className='chat-app chat-app--lesson-doc'>
			<div className='main-container'>
				<LayoutSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<LayoutHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div
						className='content-area content-area--book-lesson'
						ref={contentRef}
					>
						<div className='lesson-doc'>{children}</div>
					</div>
				</div>
			</div>
		</div>
	)

	if (!isStaffView && !studentInfo) {
		return renderShell(
			<div className='lesson-doc__state'>
				<h1 className='lesson-doc__state-title'>Inicia sesión</h1>
				<p className='lesson-doc__state-text'>
					Inicia sesión como estudiante para leer esta lección.
				</p>
				<Link to='/students/login' className='lesson-doc__state-link'>
					Ir al inicio de sesión
				</Link>
			</div>,
		)
	}

	if (isLoading) {
		return renderShell(
			<div className='lesson-doc__state'>
				<div className='lesson-doc__spinner' aria-hidden />
				<p className='lesson-doc__state-text'>Cargando lección…</p>
			</div>,
		)
	}

	if (isError || !lesson) {
		const errorMessage = error?.data?.message
			|| error?.message
			|| 'No pudimos cargar esta lección.'

		return renderShell(
			<div className='lesson-doc__state'>
				<h1 className='lesson-doc__state-title'>Lección no disponible</h1>
				<p className='lesson-doc__state-text'>{errorMessage}</p>
				<button
					type='button'
					className='lesson-doc__state-link'
					onClick={() => {
						if (backPath) {
							navigate(backPath)
							return
						}
						navigate(-1)
					}}
				>
					{backPath ? 'Volver al índice del libro' : 'Volver'}
				</button>
			</div>,
		)
	}

	const subjectLabel = lesson?.subject?.title
		? String(lesson.subject.title)
		: ''
	const unitTheme = lesson?.unitTheme ? String(lesson.unitTheme) : ''
	const heroSubtitle = lesson?.heroSubtitle
		? String(lesson.heroSubtitle)
		: ''
	const objectivesText = lesson?.objectivesText
		? String(lesson.objectivesText)
		: ''
	const mainTitle = lesson?.mainTitle ? String(lesson.mainTitle) : 'Lección'
	const folioLabel = [unitTheme, mainTitle].filter(Boolean).join(' · ')
		|| mainTitle
	const totalSheets = sheets.length + 1

	let activityCounter = 0

	return renderShell(
		<>
			<div className='lesson-doc__toolbar'>
				<div className='lesson-doc__brand'>
					<span className='lesson-doc__brand-leaf'>
						<LeafIcon />
					</span>
					<span className='lesson-doc__brand-text'>
						<strong>{unitTheme || subjectLabel || mainTitle}</strong>
						<span>{mainTitle}</span>
					</span>
				</div>
				{backPath ? (
					<div className='lesson-doc__toolbar-actions'>
						<Link
							to={backPath}
							className='lesson-doc__btn lesson-doc__btn--ghost'
						>
							← Volver
						</Link>
					</div>
				) : null}
			</div>

			<div className='lesson-doc__pages'>
				{/* ---------- Cover ---------- */}
				<section className='lesson-doc__sheet lesson-doc__cover'>
					<span className='lesson-doc__page-num'>1 / {totalSheets}</span>
					<span
						className='lesson-doc__unit'
						data-block-id='h0'
					>
						<LeafIcon size={14} />
						{mainTitle}
					</span>
					{subjectLabel ? (
						<p className='lesson-doc__cover-eyebrow'>{subjectLabel}</p>
					) : null}
					<h1
						className='lesson-doc__title'
						data-block-id='h1'
					>
						{unitTheme || mainTitle}
					</h1>
					{heroSubtitle ? (
						<p
							className='lesson-doc__subtitle'
							data-block-id='h2'
						>
							{heroSubtitle}
						</p>
					) : null}
					{objectivesText ? (
						<div
							className='lesson-doc__objectives'
							data-block-id='h3'
						>
							<p className='lesson-doc__objectives-label'>
								En esta unidad aprenderemos a:
							</p>
							<p className='lesson-doc__objectives-text'>
								{objectivesText}
							</p>
						</div>
					) : null}
					<div className='lesson-doc__cover-deco' aria-hidden>
						<LeafIcon size={260} />
					</div>
				</section>

				{/* ---------- Content sheets ---------- */}
				{sheets.map((sheetElements, sheetIndex) => (
					<section
						key={`sheet-${sheetIndex}`}
						className='lesson-doc__sheet'
					>
						<span className='lesson-doc__page-num'>
							{sheetIndex + 2} / {totalSheets}
						</span>
						{folioLabel ? (
							<div className='lesson-doc__folio'>
								<span className='lesson-doc__folio-dot' />
								{folioLabel}
							</div>
						) : null}
						{sheetElements.map((element, index) => {
							if (element?.type === 'activity') {
								activityCounter += 1
							}
							return (
								<LessonElement
									key={`el-${sheetIndex}-${index}`}
									element={element}
									activityNumber={activityCounter}
								/>
							)
						})}
					</section>
				))}
			</div>

			<p className='lesson-doc__footer'>
				Reproducción web del material de estudio · {folioLabel}
			</p>

			{hasTutorVideo ? (
				<div className='fixed-video-bottom-right lesson-doc-tutor-video'>
					<div className='fixed-video-controls'>
						<button
							type='button'
							className='fixed-video-button'
							onClick={handleClassVideoToggle}
							title={
								isClassVideoPlaying
									? 'Pausar video'
									: 'Reproducir video'
							}
						>
							{isClassVideoPlaying ? (
								<svg
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<rect x='6' y='4' width='4' height='16' />
									<rect x='14' y='4' width='4' height='16' />
								</svg>
							) : (
								<svg
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<polygon points='5 3 19 12 5 21 5 3' />
								</svg>
							)}
						</button>
					</div>
					<div className='lesson-doc-tutor-circle-shell'>
						<div className='fixed-video-wrapper'>
							{videoLoading ? (
								<div className='fixed-video-loading-overlay'>
									<svg
										width='28'
										height='28'
										viewBox='0 0 24 24'
										fill='none'
										stroke='#ffffff'
										strokeWidth='2'
										className='audio-loading-spinner'
									>
										<circle
											cx='12'
											cy='12'
											r='10'
											strokeOpacity='0.25'
										/>
										<path
											d='M12 2a10 10 0 0 1 10 10'
											strokeLinecap='round'
										/>
									</svg>
								</div>
							) : null}
							<video
								ref={classVideoRef}
								src={chapterVideoUrl}
								controls={false}
								onLoadedData={() => setVideoLoading(false)}
								onLoadStart={() => setVideoLoading(true)}
								onError={() => setVideoLoading(false)}
								onPlay={() => setIsClassVideoPlaying(true)}
								onPause={() => setIsClassVideoPlaying(false)}
								onTimeUpdate={(e) => (
									handleTimeUpdate(e.target.currentTime)
								)}
							/>
						</div>
					</div>
					<div className='fixed-video-question-wrap lesson-doc-tutor-question-wrap'>
						<textarea
							ref={questionTextareaRef}
							rows={2}
							className='fixed-video-question-input lesson-doc-tutor-question-input'
							placeholder={'Hazme una\npregunta'}
							value={questionText}
							onChange={handleQuestionChange}
						/>
						<button
							type='button'
							className='fixed-video-question-send lesson-doc-tutor-question-send'
							onClick={handleSendQuestion}
							aria-label='Enviar pregunta'
						>
							<svg
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<line x1='22' y1='2' x2='11' y2='13' />
								<polygon points='22 2 15 22 11 13 2 9 22 2' />
							</svg>
						</button>
					</div>
					{hasSuggestedQuestions && !isStaffView ? (
						<>
							{/*
							<button
								type='button'
								className='lesson-doc-suggested-link'
								onClick={handleOpenSuggestedQuestions}
							>
								<span
									className='lesson-doc-suggested-link__icon'
									aria-hidden
								>
									<svg
										width='18'
										height='18'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<circle cx='12' cy='12' r='10' />
										<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
										<line x1='12' y1='17' x2='12.01' y2='17' />
									</svg>
								</span>
								<span className='lesson-doc-suggested-link__text'>
									Examen de práctica
								</span>
								<span
									className='lesson-doc-suggested-link__arrow'
									aria-hidden
								>
									→
								</span>
							</button>
							*/}
							<button
								type='button'
								className='lesson-doc-suggested-link'
								onClick={handleOpenSuggestedPanel}
								aria-haspopup='dialog'
							>
								<span
									className='lesson-doc-suggested-link__icon'
									aria-hidden
								>
									<SparklesIcon size={16} />
								</span>
								<span className='lesson-doc-suggested-link__text'>
									Examen de práctica
									
								</span>
								<span
									className='lesson-doc-suggested-link__arrow'
									aria-hidden
								>
									→
								</span>
							</button>
						</>
					) : null}
				</div>
			) : null}

			{isSuggestedPanelOpen && hasSuggestedQuestions ? (
				<SuggestedQuestionsPanel
					lessonTitle={unitTheme || mainTitle}
					questions={suggestedQuestions}
					expandedIndex={expandedQuestionIndex}
					onToggle={handleToggleSuggestedQuestion}
					onClose={handleCloseSuggestedPanel}
				/>
			) : null}
		</>,
	)
}

export default StudentLessonPageScreen
