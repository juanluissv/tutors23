import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useGetStudentNewAnswersQuery } from '../../slices/student/studentAnswersSlice'
import { useGetProfileQuery } from '../../slices/student/studentApiSlice'
import StudentSubscriptionNotice from '../../components/StudentSubscriptionNotice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
} from '../../utils/subscriptionAccess'
import '../../App.css'

const PAGE_SIZE = 2

const PAIR_THEMES = [
	['sky', 'indigo'],
	['blue', 'pink'],
]

function themesForPage (pageIndex) {
	return PAIR_THEMES[pageIndex % PAIR_THEMES.length]
}

const THEME_GRADIENTS = {
	sky: { from: '#0369a1', to: '#7dd3fc' },
	violet: { from: '#7c3aed', to: '#c4b5fd' },
	blue: { from: '#1d4ed8', to: '#93c5fd' },
	amber: { from: '#d97706', to: '#fbbf24' },
	rose: { from: '#be123c', to: '#fb7185' },
	indigo: { from: '#4f46e5', to: '#818cf8' },
	pink: { from: '#be185d', to: '#f9a8d4' },
	cyan: { from: '#0369a1', to: '#7dd3fc' },
}

const PlayIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='currentColor'
		aria-hidden
	>
		<path d='M8 5v14l11-7z' />
	</svg>
)

const PlayIconSmall = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='currentColor'
		aria-hidden
	>
		<path d='M8 5v14l11-7z' />
	</svg>
)

const AnswerBadge = ({ theme, gradientId }) => {
	const colors = THEME_GRADIENTS[theme] ?? THEME_GRADIENTS.sky
	const id = gradientId ?? `new-answers-badge-${theme}`

	return (
		<svg
			width='28'
			height='28'
			viewBox='0 0 28 28'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			className='new-answers__badge-svg'
		>
			<circle cx='14' cy='14' r='14' fill={`url(#${id})`} />
			<path
				d='M9 14.5l3.5 3.5L19.5 11'
				stroke='white'
				strokeWidth='2.4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<defs>
				<linearGradient
					id={id}
					x1='0'
					y1='0'
					x2='28'
					y2='28'
					gradientUnits='userSpaceOnUse'
				>
					<stop stopColor={colors.from} />
					<stop offset='1' stopColor={colors.to} />
				</linearGradient>
			</defs>
		</svg>
	)
}

function teacherDisplayName (teacher) {
	if (!teacher || typeof teacher !== 'object') {
		return 'Profesor'
	}
	const parts = [teacher.firstname, teacher.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Profesor'
}

function formatQaDate (value) {
	if (value == null) {
		return ''
	}
	const d = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(d.getTime())) {
		return ''
	}
	return d.toLocaleDateString('es', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function answerQuestionTitle (answer) {
	if (answer?.question && typeof answer.question === 'object') {
		const t = answer.question.title
		if (t != null && String(t).trim() !== '') {
			return String(t).trim()
		}
	}
	const t = answer?.title
	return t != null && String(t).trim() !== '' ? String(t).trim() : 'Tu pregunta'
}

function answerHasVideo (answer) {
	return answer?.mediaId != null && String(answer.mediaId).trim() !== ''
}

function AnswerVideoThumb ({ watchTo, ariaLabel }) {
	return (
		<Link
			to={watchTo}
			className='new-answers__video'
			aria-label={ariaLabel ?? 'Ver video de la respuesta'}
		>
			<div className='new-answers__video-glow' />
			<div className='new-answers__video-placeholder'>
				<div className='new-answers__video-lines'>
					<div className='new-answers__video-line' />
					<div className='new-answers__video-line new-answers__video-line--short' />
					<div className='new-answers__video-line' />
					<div className='new-answers__video-line new-answers__video-line--short' />
				</div>
			</div>
			<div className='new-answers__play-overlay'>
				<div className='new-answers__play-btn'>
					<PlayIcon />
				</div>
			</div>
		</Link>
	)
}

function AnswerCard ({ item, theme = 'blue' }) {
	const category =
		item.subject && typeof item.subject === 'object'
			? item.subject.title
			: 'Materia'
	const watchPath = `/students/watchanswer/${String(item._id)}`
	const hasDescription =
		item.description != null && String(item.description).trim() !== ''

	return (
		<div className={`new-answers__card new-answers__card--${theme}`}>
			<div className='new-answers__card-head'>
				<span className='new-answers__tag'>{category}</span>
				<span className='new-answers__pill'>
					<span className='new-answers__pill-dot' />
					Nueva
				</span>
			</div>

			<h3 className='new-answers__card-title'>
				{answerQuestionTitle(item)}
			</h3>

			<AnswerVideoThumb
				watchTo={watchPath}
				ariaLabel='Ver video de la respuesta'
			/>

			{hasDescription && (
				<p className='new-answers__card-text'>{item.description}</p>
			)}

			<span className='new-answers__meta'>
				{teacherDisplayName(item.teacher)}
				{' · '}
				{formatQaDate(item.dateCreated)}
			</span>

			<Link to={watchPath} className='new-answers__watch'>
				Mira la respuesta
				<PlayIconSmall />
			</Link>
		</div>
	)
}

function NewAnswersConnector ({ firstTheme, secondTheme }) {
	return (
		<div className='new-answers__connector'>
			<div className='new-answers__badge'>
				<AnswerBadge
					theme={firstTheme}
					gradientId={`na-badge-${firstTheme}-first`}
				/>
			</div>
			<div className='new-answers__line' />
			<div className='new-answers__badge'>
				<AnswerBadge
					theme={secondTheme}
					gradientId={`na-badge-${secondTheme}-second`}
				/>
			</div>
		</div>
	)
}

function StudentNewAnswersScreen () {
	const navigate = useNavigate()
	const { studentInfo } = useSelector((state) => state.authStudent)
	const studentId = studentInfo?._id ? String(studentInfo._id) : null

	const {
		data: profile,
		isLoading: isLoadingProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const currentSubscription = resolveCurrentSubscription(
		profile?.subscriptions,
	)
	const canView = canViewQuestions(currentSubscription)

	const {
		data: answersFromApi = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useGetStudentNewAnswersQuery(studentId, {
		skip: !studentId || isLoadingProfile || !canView,
	})

	const newAnswers = useMemo(() => {
		const raw = Array.isArray(answersFromApi) ? answersFromApi : []
		return raw.filter(answerHasVideo)
	}, [answersFromApi])

	const totalPages = Math.max(
		1,
		Math.ceil(newAnswers.length / PAGE_SIZE),
	)

	const [currentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent('/students/newanswers')
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate])

	const paginatedAnswers = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE
		return newAnswers.slice(start, start + PAGE_SIZE)
	}, [newAnswers, currentPage])

	const pairThemes = themesForPage(currentPage - 1)
	const firstTheme = pairThemes[0]
	const secondTheme = pairThemes[1]

	if (!studentInfo) {
		return null
	}

	const errorMessage =
		error?.data?.message || error?.error
		|| 'No se pudieron cargar las nuevas respuestas.'

	return (
		<div className='chat-app ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<div className='center-content3'>
							<div className='new-answers-page new-answers-page--centered'>
								<h1 className='new-answers-page__title heading-gradient'>
									Respuestas de tus profesores
								</h1>
								<p className='new-answers-page__subtitle'>
									{canView ? (
										<>
											Tienes{' '}
											<strong>{newAnswers.length}</strong>
											{' '}
											{newAnswers.length === 1
												? 'nueva respuesta pendiente.'
												: 'nuevas respuestas pendientes.'}
										</>
									) : (
										'Mira las respuestas en video que '
										+ 'tus profesores grabaron para '
										+ 'tus preguntas.'
									)}
								</p>

								{!isLoadingProfile && !canView ? (
									<StudentSubscriptionNotice
										subscription={currentSubscription}
									/>
								) : null}

								{canView && isLoading && (
									<p className='new-answers__status'>
										Cargando respuestas…
									</p>
								)}

								{canView && isError && (
									<div className='new-answers__status'>
										<p>{errorMessage}</p>
										<button
											type='button'
											className='pagination-btn active'
											style={{ marginTop: '0.75rem' }}
											onClick={() => refetch()}
										>
											Intentar de nuevo
										</button>
									</div>
								)}

								{canView && !isLoading && !isError
									&& newAnswers.length === 0 && (
									<div className='new-answers__empty'>
										<div className='new-answers__empty-icon'>
											<AnswerBadge />
										</div>
										<p className='new-answers__empty-text'>										
											Cuando un profesor responde a tus preguntas, 
											aparecerán aquí hasta que las veas.
										</p>
									</div>
								)}

								{canView && !isLoading && !isError
									&& newAnswers.length > 0 && (
									<div className='new-answers__timeline'>
										<div
											className={`new-answers__pair ${paginatedAnswers.length === 1 ? 'new-answers__pair--single' : ''}`}
										>
											<AnswerCard
												item={paginatedAnswers[0]}
												theme={firstTheme}
											/>

											{paginatedAnswers.length > 1 && (
												<>
													<NewAnswersConnector
														firstTheme={firstTheme}
														secondTheme={secondTheme}
													/>
													<AnswerCard
														item={paginatedAnswers[1]}
														theme={secondTheme}
													/>
												</>
											)}
										</div>
									</div>
								)}

								{canView && !isLoading && !isError
									&& totalPages > 1 && (
									<div className='pagination pagination--answers new-answers__pagination'>
										{Array.from(
											{ length: totalPages },
											(_, i) => i + 1,
										).map((page) => (
											<button
												key={page}
												type='button'
												className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
												onClick={() => setCurrentPage(page)}
											>
												{page}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentNewAnswersScreen
