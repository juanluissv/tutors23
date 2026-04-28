import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

const PlayIconLarge = () => (
	<svg
		width='48'
		height='48'
		viewBox='0 0 48 48'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<circle cx='24' cy='24' r='24' fill='rgba(255,255,255,0.92)' />
		<path d='M19 15l14 9-14 9V15z' fill='url(#wn-play-lg)' />
		<defs>
			<linearGradient
				id='wn-play-lg'
				x1='19'
				y1='15'
				x2='33'
				y2='24'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0369a1' />
				<stop offset='1' stopColor='#0ea5e9' />
			</linearGradient>
		</defs>
	</svg>
)

const AiIcon = () => (
	<svg
		width='32'
		height='32'
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect x='2' y='6' width='28' height='20' rx='6' fill='url(#wn-ai-bg)' />
		<circle cx='11' cy='16' r='2.5' fill='white' />
		<circle cx='21' cy='16' r='2.5' fill='white' />
		<rect x='9' y='22' width='2' height='4' rx='1' fill='url(#wn-ai-bg)' />
		<rect x='21' y='22' width='2' height='4' rx='1' fill='url(#wn-ai-bg)' />
		<rect x='13' y='3' width='6' height='4' rx='2' fill='url(#wn-ai-bg)' />
		<defs>
			<linearGradient
				id='wn-ai-bg'
				x1='2'
				y1='3'
				x2='30'
				y2='26'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0ea5e9' />
				<stop offset='1' stopColor='#0284c7' />
			</linearGradient>
		</defs>
	</svg>
)

const question = {
	id: 1,
	subject: 'Email Marketing',
	subjectColor: 'sky',
	title: 'how to create Custom audience ?',
	description: 'how can I create Custom audience from a email list ?',
	student: 'Mark Amstrong',
	date: '2025-10-24',
}

function TeacherWatchNewScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [isPlaying, setIsPlaying] = useState(false)
	const videoRef = useRef(null)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handlePlayToggle = () => {
		setIsPlaying(!isPlaying)
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
						<div className='watch-new'>
							{/* <Link
								to='/teachers/newquestions'
								className='watch-new__back'
							>
								&#8592; Back to questions
							</Link> */}

							<h1
								className={`watch-new__subject watch-new__subject--${question.subjectColor}`}
							>
								{question.subject}
							</h1>
							<div
								className={`watch-new__subject-line watch-new__subject-line--${question.subjectColor}`}
							/>

							<div className='watch-new__player'>
								<div className='watch-new__video-area'>
									<video
										ref={videoRef}
										className='watch-new__video'
										poster=''
									>
										<source src='' type='video/mp4' />
									</video>
									<div className='watch-new__video-placeholder'>
										<div className='watch-new__placeholder-lines'>
											<div className='watch-new__ph-line' />
											<div className='watch-new__ph-line watch-new__ph-line--short' />
											<div className='watch-new__ph-line' />
											<div className='watch-new__ph-line watch-new__ph-line--short' />
										</div>
									</div>
									<button
										type='button'
										className='watch-new__play-btn'
										onClick={handlePlayToggle}
										aria-label={isPlaying ? 'Pause' : 'Play'}
									>
										<PlayIconLarge />
									</button>
								</div>

								<div className='watch-new__controls'>
									<button
										type='button'
										className='watch-new__ctrl-btn'
										onClick={handlePlayToggle}
										aria-label={isPlaying ? 'Pause' : 'Play'}
									>
										{isPlaying ? (
											<svg width='16' height='16' viewBox='0 0 24 24' fill='#475569'>
												<rect x='6' y='4' width='4' height='16' rx='1' />
												<rect x='14' y='4' width='4' height='16' rx='1' />
											</svg>
										) : (
											<svg width='16' height='16' viewBox='0 0 24 24' fill='#475569'>
												<path d='M8 5v14l11-7z' />
											</svg>
										)}
									</button>
									<div className='watch-new__progress'>
										<div className='watch-new__progress-bar'>
											<div
												className='watch-new__progress-fill'
												style={{ width: '12%' }}
											/>
										</div>
									</div>
									<span className='watch-new__time'>-0:51</span>
								</div>
							</div>

							<div className='watch-new__info'>
								<h2 className='watch-new__title'>
									{question.title}
								</h2>
								<p className='watch-new__description'>
									{question.description}
								</p>
								{/* <span className='watch-new__meta'>
									from {question.student} &middot; {question.date}
								</span> */}
							</div>

							<Link
								to='/teachers/answerdetails'
								className='watch-new__answer-btn'
							>
								Answer Question
							</Link>

							<div className='watch-new__ai-helper'>
								<div className='watch-new__ai-icon'>
									<AiIcon />
								</div>
								<span className='watch-new__ai-text'>
									Ask AI Assistance help with this question
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherWatchNewScreen
