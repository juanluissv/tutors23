import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetTeacherPreviousQuestionsQuery } from '../../slices/teachers/teacherPreviousQuestionsSlice'
import '../../App.css'

const PAGE_SIZE = 1

const PlayIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='#64748b'
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

const QuestionBadge = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 28 28'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='qa-timeline__badge-svg'
	>
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-q-tchr)' />
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
				id='qa-badge-q-tchr'
				x1='0'
				y1='0'
				x2='28'
				y2='28'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#6366f1' />
				<stop offset='1' stopColor='#818cf8' />
			</linearGradient>
		</defs>
	</svg>
)

const AnswerBadge = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 28 28'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='qa-timeline__badge-svg'
	>
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-a-tchr)' />
		<path
			d='M9 14.5l3.5 3.5L19.5 11'
			stroke='white'
			strokeWidth='2.4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<defs>
			<linearGradient
				id='qa-badge-a-tchr'
				x1='0'
				y1='0'
				x2='28'
				y2='28'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0ea5e9' />
				<stop offset='1' stopColor='#38bdf8' />
			</linearGradient>
		</defs>
	</svg>
)

function studentDisplayName (student) {
	if (!student || typeof student !== 'object') {
		return 'Student'
	}
	const parts = [student.firstname, student.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Student'
}

function teacherDisplayName (teacher) {
	if (!teacher || typeof teacher !== 'object') {
		return 'Teacher'
	}
	const parts = [teacher.firstname, teacher.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Teacher'
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

function questionHasVideo (q) {
	return q?.mediaId != null && String(q.mediaId).trim() !== ''
}

function answerHasVideo (a) {
	return a?.mediaId != null && String(a.mediaId).trim() !== ''
}

function QaTimelineVideoThumb ({
	watchTo,
	ariaLabel,
}) {
	const inner = (
		<>
			<div className='qa-timeline__video-placeholder'>
				<div className='qa-timeline__video-lines'>
					<div className='qa-timeline__video-line' />
					<div className={
						'qa-timeline__video-line '
						+ 'qa-timeline__video-line--short'
					}
					/>
					<div className='qa-timeline__video-line' />
					<div className={
						'qa-timeline__video-line '
						+ 'qa-timeline__video-line--short'
					}
					/>
				</div>
			</div>
			<div className='qa-timeline__play-overlay'>
				<div className='qa-timeline__play-btn'>
					<PlayIcon />
				</div>
			</div>
		</>
	)
	if (watchTo != null && String(watchTo).trim() !== '') {
		return (
			<Link
				to={watchTo}
				className='qa-timeline__video'
				aria-label={ariaLabel ?? 'Watch video'}
			>
				{inner}
			</Link>
		)
	}
	return (
		<div className='qa-timeline__video'>
			{inner}
		</div>
	)
}

function TeacherOldQuestionsScreen () {
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const [currentPage, setCurrentPage] = useState(1)

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetTeacherPreviousQuestionsQuery(
		{ page: currentPage, limit: PAGE_SIZE },
		{ skip: !teacherInfo },
	)

	const items = Array.isArray(data?.items) ? data.items : []
	const totalPages =
		data?.pages != null && data.pages > 0 ? data.pages : 0
	const total = data?.total ?? 0
	const convo = items[0]

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	useEffect(() => {
		if (totalPages > 0 && currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	if (!teacherInfo) {
		return null
	}

	const errorMessage =
		error?.data?.message || error?.error
			|| 'Could not load previous questions.'

	const subjectTitle =
		convo?.subject && typeof convo.subject === 'object'
			? convo.subject.title
			: null

	const answerDoc =
		convo?.answer != null && typeof convo.answer === 'object'
			? convo.answer
			: null

	const canWatchQuestionVideo =
		convo != null && questionHasVideo(convo)

	const questionWatchTo =
		canWatchQuestionVideo && convo != null
			? `/teachers/watchnew?questionId=${String(convo._id)}`
			: null

	const answerWatchTo =
		answerDoc != null
			&& answerDoc._id != null
			&& answerHasVideo(answerDoc)
			? `/teachers/watchanswer/${String(answerDoc._id)}`
			: null

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
							<div className='qa-timeline-page'>
								<h1 className='qa-timeline-page__title heading-gradient'>
									Questions &amp; answers
								</h1>
								<p className='qa-timeline-page__subtitle'>
									Past student questions you have answered — open
									the videos or read the text below.
								</p>

								{isLoading && (
									<p className='answers-heading' style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										Loading…
									</p>
								)}

								{isError && (
									<div style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										<p className='answers-heading'>
											{errorMessage}
										</p>
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

								{!isLoading && !isError && total === 0 && (
									<p className='answers-heading' style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										No answered conversations yet. When you reply
										to a student question, it will appear here.
									</p>
								)}

								{!isLoading && !isError && convo != null && (
									<div className='qa-timeline'>
										<div className='qa-timeline__pair'>
											<div className={
												'qa-timeline__card '
												+ 'qa-timeline__card--question'
											}
											>
												<span className={
													'qa-timeline__tag '
													+ 'qa-timeline__tag--question'
												}
												>
													{subjectTitle ?? 'Subject'}
												</span>
												<h3 className='qa-timeline__card-title'>
													{convo.title}
												</h3>
												<QaTimelineVideoThumb
													watchTo={questionWatchTo}
													ariaLabel='Watch student question'
												/>
												{convo.description != null
													&& String(convo.description)
														.trim() !== '' && (
													<p className={
														'qa-timeline__card-text'
													}
													>
														{convo.description}
													</p>
												)}
												<span className='qa-timeline__meta'>
													{studentDisplayName(
														convo.student,
													)}
													{' · '}
													{formatQaDate(
														convo.dateCreated,
													)}
												</span>
												{canWatchQuestionVideo
													&& convo != null ? (
														<Link
															to={
																`/teachers/watchnew?questionId=${
																	String(convo._id)
																}`
															}
															className={
																'qa-timeline__watch '
																+ 'qa-timeline__watch--question'
															}
														>
															Watch question
															<PlayIconSmall />
														</Link>
													) : (
														<button
															type='button'
															disabled
															className={
																'qa-timeline__watch '
																+ 'qa-timeline__watch--question'
															}
															style={{
																opacity: 0.55,
																cursor: 'not-allowed',
															}}
															title='No question video'
														>
															No question video
														</button>
													)}
											</div>

											<div className={
												'qa-timeline__connector'
											}
											>
												<div className={
													'qa-timeline__badge'
												}
												>
													<QuestionBadge />
												</div>
												<div className={
													'qa-timeline__line'
												}
												/>
												<div className={
													'qa-timeline__badge'
												}
												>
													<AnswerBadge />
												</div>
											</div>

											<div className={
												'qa-timeline__card '
												+ 'qa-timeline__card--answer'
											}
											>
												<span className={
													'qa-timeline__tag '
													+ 'qa-timeline__tag--answer'
												}
												>
													Your answer
												</span>
												<QaTimelineVideoThumb
													watchTo={answerWatchTo}
													ariaLabel='Watch your answer'
												/>
												{answerDoc != null ? (
													<>
														{answerDoc.description
															!= null
															&& String(
																answerDoc.description,
															).trim() !== '' && (
															<p className={
																'qa-timeline__card-text'
															}
															>
																{
																	answerDoc.description
																}
															</p>
														)}
														<span className={
															'qa-timeline__meta'
														}
														>
															{teacherDisplayName(
																answerDoc.teacher,
															)}
															{' · '}
															{formatQaDate(
																answerDoc.dateCreated,
															)}
														</span>
														{answerWatchTo != null && (
															<Link
																to={answerWatchTo}
																className={
																	'qa-timeline__watch '
																	+ 'qa-timeline__watch--answer'
																}
															>
																Watch answer
																<PlayIconSmall />
															</Link>
														)}
													</>
												) : (
													<p className={
														'qa-timeline__card-text'
													}
													>
														Answer details are not
														available.
													</p>
												)}
											</div>
										</div>
									</div>
								)}

								{!isLoading && !isError && totalPages > 1 && (
									<div className={
										'pagination pagination--answers'
									}
									style={{ marginTop: '1.5rem' }}
									>
										{Array.from(
											{ length: totalPages },
											(_, i) => i + 1,
										).map((page) => (
											<button
												key={page}
												type='button'
												className={
													'pagination-btn '
													+ (currentPage === page
														? 'active'
														: '')
												}
												onClick={() => setCurrentPage(
													page,
												)}
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

export default TeacherOldQuestionsScreen
