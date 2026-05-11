import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetQuestionsByTeacherIdQuery } from '../../slices/teachers/teacherQuestionsSlice'
import '../../App.css'

const PAGE_SIZE = 2

/** Purple cards + sky blue (same palette as answer side in TeacherOldQuestionsScreen). */
const CATEGORY_THEME_CYCLE = ['purple', 'sky']

function themeColorForCardIndex (cardIndex) {
	return CATEGORY_THEME_CYCLE[
		Math.max(0, cardIndex) % CATEGORY_THEME_CYCLE.length
	]
}

const PlayIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="#6b7280" aria-hidden>
		<path d="M8 5v14l11-7z" />
	</svg>
)

const PlayIconSmall = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
		<path d="M8 5v14l11-7z" />
	</svg>
)

function questionHasVideo (question) {
	return question?.mediaId != null && String(question.mediaId).trim() !== ''
}

/** True when linked Answer doc has an uploaded video (see question.answer ref). */
function teacherAnswerHasVideo (question) {
	const ans = question?.answer
	if (ans == null || ans === '') return false
	if (typeof ans === 'object') {
		const mid = ans.mediaId
		return mid != null && String(mid).trim() !== ''
	}
	return false
}

/** Student sent a question video; teacher still owes an answer video if any. */
function isAwaitingTeacherAnswerVideo (question) {
	return questionHasVideo(question) && !teacherAnswerHasVideo(question)
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
							<h3 className='main-heading-answers answers-heading heading-gradient'>
								{newQuestions.length} new video questions from students
							</h3>

							{isLoading && (
								<p className='answers-heading' style={{ marginTop: '1rem' }}>
									Loading questions…
								</p>
							)}

							{isError && (
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

							{!isLoading && !isError && newQuestions.length === 0 && (
								<p className='answers-heading' style={{ marginTop: '1rem' }}>
									No unanswered questions yet. When students submit videos,
									they will appear here.
								</p>
							)}

							<div className='answers-container'>
								<div className='answers-cards teacher-new-questions__cards'>
									{!isLoading && !isError
										&& paginatedQuestions.map((item, cardIndex) => {
											const category =
												item.subject && typeof item.subject === 'object'
													? item.subject.title
													: 'Subject'
											const listIndex =
												(currentPage - 1) * PAGE_SIZE + cardIndex
											const categoryColor =
												themeColorForCardIndex(listIndex)
											const watchPath =
												`/teachers/watchnew?questionId=${String(item._id)}`

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
															{item.title}
														</h3>

														<Link
															to={watchPath}
															className={`watch-answer-btn watch-answer-${categoryColor}`}
														>
															Watch question
															<PlayIconSmall />
														</Link>
													</div>
												</div>
											)
										})}
								</div>
							</div>

							{!isLoading && !isError && totalPages > 1 && (
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

export default TeacherNewQuestionsScreen
