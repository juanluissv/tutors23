import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetQuestionsByTeacherIdQuery } from '../../slices/teachers/teacherQuestionsSlice'
import '../../App.css'

const PAGE_SIZE = 2

const CARD_THEME_CYCLE = ['sky', 'amber', 'sky', 'violet', 'violet']
//const CARD_THEME_CYCLE = ['amber', 'sky', 'indigo', 'blue', 'violet' ]

function themeForQuestionId (id) {
	const s = String(id ?? '')
	let sum = 0
	for (let i = 0; i < s.length; i += 1) {
		sum += s.charCodeAt(i)
	}
	return CARD_THEME_CYCLE[sum % CARD_THEME_CYCLE.length]
}

const THEME_GRADIENTS = {
	sky: { from: '#0369a1', to: '#38bdf8' },
	violet: { from: '#6d28d9', to: '#c084fc' },
	blue: { from: '#1d4ed8', to: '#60a5fa' },
	amber: { from: '#d97706', to: '#fbbf24' },
	rose: { from: '#be123c', to: '#fb7185' },
	indigo: { from: '#4338ca', to: '#818cf8' },
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

const QuestionBadge = ({ theme = 'indigo', gradientId }) => {
	const colors = THEME_GRADIENTS[theme] ?? THEME_GRADIENTS.indigo
	const id = gradientId ?? `new-questions-badge-${theme}`

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
			<text
				x='14'
				y='18.5'
				textAnchor='middle'
				fill='white'
				fontSize='14'
				fontWeight='700'
				fontFamily='Inter, sans-serif'
			>
				?
			</text>
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

const TimelineBadge = ({ theme, gradientId }) => {
	const colors = THEME_GRADIENTS[theme] ?? THEME_GRADIENTS.sky
	const id = gradientId ?? `nq-timeline-badge-${theme}`

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

function studentDisplayName (student) {
	if (!student || typeof student !== 'object') {
		return 'Student'
	}
	const parts = [student.firstname, student.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Student'
}

function formatQaDate (value) {
	if (value == null) {
		return ''
	}
	const d = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(d.getTime())) {
		return ''
	}
	return d.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function questionHasVideo (question) {
	return question?.mediaId != null && String(question.mediaId).trim() !== ''
}

function teacherAnswerHasVideo (question) {
	const ans = question?.answer
	if (ans == null || ans === '') {
		return false
	}
	if (typeof ans === 'object') {
		const mid = ans.mediaId
		return mid != null && String(mid).trim() !== ''
	}
	return false
}

function isAwaitingTeacherAnswerVideo (question) {
	return questionHasVideo(question) && !teacherAnswerHasVideo(question)
}

function QuestionVideoThumb ({ watchTo, ariaLabel }) {
	return (
		<Link
			to={watchTo}
			className='new-answers__video'
			aria-label={ariaLabel ?? 'Watch question video'}
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

function QuestionCard ({ item }) {
	const category =
		item.subject && typeof item.subject === 'object'
			? item.subject.title
			: 'Subject'
	const watchPath = `/teachers/watchnew?questionId=${String(item._id)}`
	const theme = themeForQuestionId(item._id)
	const hasDescription =
		item.description != null && String(item.description).trim() !== ''

	return (
		<div className={`new-answers__card new-answers__card--${theme}`}>
			<div className='new-answers__card-head'>
				<span className='new-answers__tag'>{category}</span>
				<span className='new-answers__pill'>
					<span className='new-answers__pill-dot' />
					New
				</span>
			</div>

			<h3 className='new-answers__card-title'>{item.title}</h3>

			<QuestionVideoThumb
				watchTo={watchPath}
				ariaLabel='Watch question video'
			/>

			{hasDescription && (
				<p className='new-answers__card-text'>{item.description}</p>
			)}

			<span className='new-answers__meta'>
				{studentDisplayName(item.student)}
				{' · '}
				{formatQaDate(item.dateCreated)}
			</span>

			<Link to={watchPath} className='new-answers__watch'>
				Watch question
				<PlayIconSmall />
			</Link>
		</div>
	)
}

function NewQuestionsConnector ({ firstTheme, secondTheme }) {
	return (
		<div className='new-answers__connector'>
			<div className='new-answers__badge'>
				<TimelineBadge
					theme={firstTheme}
					gradientId={`nq-badge-${firstTheme}-first`}
				/>
			</div>
			<div className='new-answers__line' />
			<div className='new-answers__badge'>
				<TimelineBadge
					theme={secondTheme}
					gradientId={`nq-badge-${secondTheme}-second`}
				/>
			</div>
		</div>
	)
}

function TeacherNewQuestionsScreen () {
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id ? String(teacherInfo._id) : null

	const {
		data: questionsFromApi = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useGetQuestionsByTeacherIdQuery(teacherId, { skip: !teacherId })

	const newQuestions = useMemo(
		() =>
			(questionsFromApi || []).filter((q) =>
				isAwaitingTeacherAnswerVideo(q),
			),
		[questionsFromApi],
	)

	const totalPages = Math.max(
		1,
		Math.ceil(newQuestions.length / PAGE_SIZE),
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
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const paginatedQuestions = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE
		return newQuestions.slice(start, start + PAGE_SIZE)
	}, [newQuestions, currentPage])

	if (!teacherInfo) {
		return null
	}

	const errorMessage =
		error?.data?.message || error?.error || 'Could not load questions.'

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<TeacherSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<TeacherHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<div className='center-content3'>
							<div className='new-answers-page new-answers-page--centered'>
								<h1 className='new-answers-page__title heading-gradient'>
									New video questions from students
								</h1>
								<p className='new-answers-page__subtitle'>
									You have{' '}
									<strong>{newQuestions.length}</strong>{' '}
									new video{' '}
									{newQuestions.length === 1
										? 'question'
										: 'questions'}{' '}
									waiting for your reply. Watch them and record
									your answer.
								</p>

								{isLoading && (
									<p className='new-answers__status'>
										Loading questions…
									</p>
								)}

								{isError && (
									<div className='new-answers__status'>
										<p>{errorMessage}</p>
										<button
											type='button'
											className='pagination-btn active'
											style={{ marginTop: '0.75rem' }}
											onClick={() => refetch()}
										>
											Try again
										</button>
									</div>
								)}

								{!isLoading && !isError
									&& newQuestions.length === 0 && (
									<div className='new-answers__empty'>
										<div className='new-answers__empty-icon'>
											<QuestionBadge />
										</div>
										<p className='new-answers__empty-text'>
											No unanswered questions yet. When
											students submit videos, they will
											appear here.
										</p>
									</div>
								)}

								{!isLoading && !isError
									&& newQuestions.length > 0 && (
									<div className='new-answers__timeline'>
										<div
											className={`new-answers__pair ${paginatedQuestions.length === 1 ? 'new-answers__pair--single' : ''}`}
										>
											<QuestionCard item={paginatedQuestions[0]} />

											{paginatedQuestions.length > 1 && (
												<>
													<NewQuestionsConnector
														firstTheme={themeForQuestionId(
															paginatedQuestions[0]._id,
														)}
														secondTheme={themeForQuestionId(
															paginatedQuestions[1]._id,
														)}
													/>
													<QuestionCard
														item={paginatedQuestions[1]}
													/>
												</>
											)}
										</div>
									</div>
								)}

								{!isLoading && !isError && totalPages > 1 && (
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

export default TeacherNewQuestionsScreen
