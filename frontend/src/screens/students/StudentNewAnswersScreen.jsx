import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useGetStudentNewAnswersQuery } from '../../slices/student/studentAnswersSlice'
import { useGetProfileQuery } from '../../slices/student/studentApiSlice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
import '../../App.css'

const PAGE_SIZE = 2

const CATEGORY_THEME_CYCLE = ['sky', 'purple', 'indigo', 'teal']

function themeColorForAnswerId (id) {
	const s = String(id ?? '')
	let sum = 0
	for (let i = 0; i < s.length; i += 1) {
		sum += s.charCodeAt(i)
	}
	return CATEGORY_THEME_CYCLE[sum % CATEGORY_THEME_CYCLE.length]
}

const PlayIcon = () => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='#6b7280' aria-hidden>
		<path d='M8 5v14l11-7z' />
	</svg>
)

const PlayIconSmall = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
		<path d='M8 5v14l11-7z' />
	</svg>
)

function answerQuestionTitle (answer) {
	if (answer?.question && typeof answer.question === 'object') {
		const t = answer.question.title
		if (t != null && String(t).trim() !== '') {
			return String(t).trim()
		}
	}
	const t = answer?.title
	return t != null && String(t).trim() !== '' ? String(t).trim() : 'Your question'
}

function answerHasVideo (answer) {
	return answer?.mediaId != null && String(answer.mediaId).trim() !== ''
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
	const viewBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'view',
	)

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

	if (!studentInfo) {
		return null
	}

	const errorMessage =
		error?.data?.message || error?.error || 'Could not load new answers.'

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
							<h3 className='main-heading-answers answers-heading heading-gradient'>
								{canView ? (
									<>
										{newAnswers.length}{' '}
										new{' '}
										{newAnswers.length === 1
											? 'answer'
											: 'answers'}{' '}
										from teachers
									</>
								) : (
									'New answers from teachers'
								)}
							</h3>

							{!isLoadingProfile && !canView ? (
								<div className='ask-subscription-notice'>
									<p className='ask-subscription-notice__title'>
										Subscription required
									</p>
									<p className='ask-subscription-notice__text'>
										{viewBlockReason}
									</p>
									<Link
										to='/students/subscription'
										className='ask-subscription-notice__link'
									>
										View plans & subscribe
									</Link>
								</div>
							) : null}

							{canView && isLoading && (
								<p className='answers-heading' style={{ marginTop: '1rem' }}>
									Loading answers…
								</p>
							)}

							{canView && isError && (
								<div style={{ marginTop: '1rem' }}>
									<p className='answers-heading'>{errorMessage}</p>
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

							{canView && !isLoading && !isError && newAnswers.length === 0 && (
								<p className='answers-heading' style={{ marginTop: '1rem' }}>
									No new answers yet. When a teacher responds to your
									questions, they will appear here until you watch them.
								</p>
							)}

							<div className='answers-container'>
								<div className='answers-cards'>
									{canView && !isLoading && !isError
										&& paginatedAnswers.map((item) => {
											const category =
												item.subject
												&& typeof item.subject === 'object'
													? item.subject.title
													: 'Subject'
											const categoryColor = themeColorForAnswerId(
												item._id,
											)
											const watchPath =
												`/students/watchanswer/${String(item._id)}`

											return (
												<div
													key={String(item._id)}
													className='answer-card-wrapper'
												>
													<div
														className={`answer-card answer-card--theme-${categoryColor}`}
													>
														<span
															className={`answer-category answer-category-${categoryColor}`}
														>
															{category}
														</span>

														<div className='answer-thumbnail'>
															<div className='thumbnail-placeholder'>
																<div className='thumbnail-lines'>
																	<div className='line' />
																	<div className='line short' />
																	<div className='line' />
																	<div className='line short' />
																</div>
															</div>
															<div className='play-overlay'>
																<div className='play-button'>
																	<PlayIcon />
																</div>
															</div>
														</div>

														<h3 className='answer-question'>
															{answerQuestionTitle(item)}
														</h3>

														<Link
															to={watchPath}
															className={`watch-answer-btn watch-answer-${categoryColor}`}
														>
															Watch Answer
															<PlayIconSmall />
														</Link>
													</div>
												</div>
											)
										})}
								</div>
							</div>

							{canView && !isLoading && !isError && totalPages > 1 && (
								<div className='pagination pagination--answers'>
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
	)
}

export default StudentNewAnswersScreen
