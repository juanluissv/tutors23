import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { useGetBookLessonByIdQuery } from '../../slices/student/studentApiSlice'
import { useGetBookLessonByIdForSchoolAdminQuery } from '../../slices/admin/schoolAdminApiSlice'
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

	if (!text && items.length === 0) {
		return null
	}

	switch (type) {
	case 'eyebrow':
		return <p className='lesson-doc__section-title'>{text}</p>
	case 'h1':
	case 'h2':
		return <h2 className='lesson-doc__h2'>{text}</h2>
	case 'h3':
		return <h3 className='lesson-doc__h3'>{text}</h3>
	case 'h4':
		return <h4 className='lesson-doc__h4'>{text}</h4>
	case 'h5':
		return <h5 className='lesson-doc__h5'>{text}</h5>
	case 'objectives':
		return (
			<div className='lesson-doc__callout'>
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
			<div className='lesson-doc__doc'>
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
			<div className={`lesson-doc__callout lesson-doc__callout--${variant}`}>
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
			<div>
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
			<div>
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
			<ul className='lesson-doc__numbered'>
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
			<ul className='lesson-doc__list'>
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
			<div className='lesson-doc__diagram'>
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
			<div className='lesson-doc__map'>
				{text ? (
					<p className='lesson-doc__section-title'>{text}</p>
				) : null}
				<div className='lesson-doc__grid'>
					{items.map((item, itemIndex) => (
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
								{item.body || item.text}
							</p>
						</div>
					))}
				</div>
			</div>
		)
	case 'figure':
		return (
			<div className='lesson-doc__figure'>
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
			<div className='lesson-doc__chips'>
				{items.map((item, itemIndex) => (
					<span key={`chip-${itemIndex}`} className='lesson-doc__chip'>
						{item.text}
					</span>
				))}
			</div>
		)
	case 'table': {
		const headers = Array.isArray(meta.headers) ? meta.headers : []
		return (
			<div className='lesson-doc__table-wrap'>
				{text ? (
					<p className='lesson-doc__table-caption'>{text}</p>
				) : null}
				<table className='lesson-doc__table'>
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
						{items.map((item, rowIndex) => {
							const cells = Array.isArray(item.cells)
								? item.cells
								: []
							return (
								<tr key={`tr-${rowIndex}`}>
									{cells.map((cell, cellIndex) => (
										<td key={`td-${rowIndex}-${cellIndex}`}>
											{cell || '—'}
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
			<div className='lesson-doc__chart'>
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
		return <p className='lesson-doc__p'>{text}</p>
	}
}

function StudentLessonPageScreen () {
	const navigate = useNavigate()
	const { lessonId, subjectId } = useParams()
	const { studentInfo } = useSelector((state) => state.authStudent)
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const isSchoolAdminView = Boolean(subjectId)
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	useEffect(() => {
		if (isSchoolAdminView && !schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [isSchoolAdminView, schoolAdminInfo, navigate])

	const {
		data: studentLesson,
		isLoading: isStudentLoading,
		isError: isStudentError,
		error: studentError,
	} = useGetBookLessonByIdQuery(lessonId, {
		skip: !lessonId || !studentInfo || isSchoolAdminView,
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

	const lesson = isSchoolAdminView ? schoolAdminLesson : studentLesson
	const isLoading = isSchoolAdminView ? isSchoolAdminLoading : isStudentLoading
	const isError = isSchoolAdminView ? isSchoolAdminError : isStudentError
	const error = isSchoolAdminView ? schoolAdminError : studentError

	console.log(lesson?.content)

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

	const LayoutSidebar = isSchoolAdminView ? AdminSidebar : Sidebar
	const LayoutHeader = isSchoolAdminView ? AdminHeader : Header

	if (isSchoolAdminView && !schoolAdminInfo) {
		return null
	}

	const backPath = isSchoolAdminView
		? `/schooladmins/generatelessons/${subjectId}`
		: null

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
					<div className='content-area content-area--book-lesson'>
						<div className='lesson-doc'>{children}</div>
					</div>
				</div>
			</div>
		</div>
	)

	if (!isSchoolAdminView && !studentInfo) {
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
					{backPath ? 'Volver a generar lecciones' : 'Volver'}
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
					<span className='lesson-doc__unit'>
						<LeafIcon size={14} />
						{mainTitle}
					</span>
					{subjectLabel ? (
						<p className='lesson-doc__cover-eyebrow'>{subjectLabel}</p>
					) : null}
					<h1 className='lesson-doc__title'>
						{unitTheme || mainTitle}
					</h1>
					{heroSubtitle ? (
						<p className='lesson-doc__subtitle'>{heroSubtitle}</p>
					) : null}
					{objectivesText ? (
						<div className='lesson-doc__objectives'>
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
		</>,
	)
}

export default StudentLessonPageScreen
