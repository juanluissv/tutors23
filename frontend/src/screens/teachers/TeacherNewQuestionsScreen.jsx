import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

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

function TeacherNewQuestionsScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const [currentPage, setCurrentPage] = useState(1)

	const questions = [
		{
			id: 1,
			category: 'Algebra',
			categoryColor: 'sky',
			question: 'Can you explain how to factor this quadratic?',
		},
		{
			id: 2,
			category: 'Biology',
			categoryColor: 'purple',
			question: 'What is the difference between mitosis and meiosis?',
		},
	]

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
								{questions.length} new video questions from students
							</h3>

							<div className='answers-container'>
								<div className='answers-cards'>
									{questions.map((item) => (
										<div key={item.id} className='answer-card-wrapper'>
											<div
												className={`answer-card answer-card--theme-${item.categoryColor}`}
											>
												<span
													className={`answer-category answer-category-${item.categoryColor}`}
												>
													{item.category}
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

												<h3 className='answer-question'>{item.question}</h3>

												<Link
													to='/teachers/watchnew'
													className={`watch-answer-btn watch-answer-${item.categoryColor}`}
												>
													Watch question
													<PlayIconSmall />
												</Link>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className='pagination pagination--answers'>
								<button
									type='button'
									className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
									onClick={() => setCurrentPage(1)}
								>
									1
								</button>
								<button
									type='button'
									className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`}
									onClick={() => setCurrentPage(2)}
								>
									2
								</button>
								<button
									type='button'
									className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`}
									onClick={() => setCurrentPage(3)}
								>
									3
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherNewQuestionsScreen
