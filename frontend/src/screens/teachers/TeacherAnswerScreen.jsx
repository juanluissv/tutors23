import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

function TeacherAnswerScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

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
						<div className='center-content2'>
							<h1 className='main-heading heading-gradient teacher-answer__heading'>
								Record your answer
							</h1>

							<p className='upload-subtitle teacher-answer__subtitle'>
								Choose how you want to record your answer
							</p>

							<div className='upload-cards-container'>
								<Link
									to='/teachers/answerscreen'
									className='upload-card upload-card-sky'
									aria-label='Record PC screen, up to 5 minutes'
								>
									<div className='upload-card-header'>
										<h2>Record PC screen</h2>
										<div className='upload-card-icon'>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M23 7l-7 5 7 5V7z' />
												<rect
													x='1'
													y='5'
													width='15'
													height='14'
													rx='2'
													ry='2'
												/>
											</svg>
										</div>
									</div>
									<p className='upload-card-subtitle'>
										&#10022; Record up to a 5 minutes answer
									</p>
								</Link>

								<Link
									to='/teachers/answercamera'
									className='upload-card upload-card-deepsky'
									aria-label='Record with camera, up to 5 minutes'
								>
									<div className='upload-card-header'>
										<h2>Record<br />Camera</h2>
										<div className='upload-card-icon'>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
												<circle cx='12' cy='13' r='4' />
											</svg>
										</div>
									</div>
									<p className='upload-card-subtitle'>
										&#8593; Record up to a 5 minutes answer
									</p>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherAnswerScreen
