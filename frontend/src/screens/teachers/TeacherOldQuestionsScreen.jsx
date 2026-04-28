import React, { useState } from 'react'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

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
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-q)' />
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
				id='qa-badge-q'
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
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-a)' />
		<path
			d='M9 14.5l3.5 3.5L19.5 11'
			stroke='white'
			strokeWidth='2.4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<defs>
			<linearGradient
				id='qa-badge-a'
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

const conversations = [
	{
		id: 1,
		subject: 'LinkedIn Marketing',
		question: {
			title: 'How Do I Target Countries?',
			text: 'How Can I only target USA with Ads',
			student: 'Mark Amstrong',
			date: '2025-10-24',
		},
		answer: {
			text: 'You have to Create a USA audience',
			teacher: 'Ana Smith',
			date: '2025-10-24',
		},
	},
	{
		id: 2,
		subject: 'LinkedIn Marketing',
		question: {
			title: 'Budget for LinkedIn Ads?',
			text: 'What daily budget should I start with for a small campaign?',
			student: 'Sara Lopez',
			date: '2025-10-22',
		},
		answer: {
			text: 'Start with $10/day and scale once your CTR is above 1%',
			teacher: 'Ana Smith',
			date: '2025-10-23',
		},
	},
	{
		id: 3,
		subject: 'Email Marketing',
		question: {
			title: 'Open rate dropping?',
			text: 'My open rates went from 40% to 18% this month',
			student: 'James Chen',
			date: '2025-10-20',
		},
		answer: {
			text: 'Check your sender reputation and clean your list with a re-engagement flow',
			teacher: 'Ana Smith',
			date: '2025-10-21',
		},
	},
]

function TeacherOldQuestionsScreen () {
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
						<div className='qa-timeline-page'>
							<h1 className='qa-timeline-page__title heading-gradient'>
								Questions &amp; Answers
							</h1>
							<p className='qa-timeline-page__subtitle'>
								Browse past video conversations between students and teachers.
							</p>

							<div className='qa-timeline'>
								{conversations.map((convo) => (
									<div key={convo.id} className='qa-timeline__pair'>
										<div className='qa-timeline__card qa-timeline__card--question'>
											<span className='qa-timeline__tag qa-timeline__tag--question'>
												{convo.subject}
											</span>
											<h3 className='qa-timeline__card-title'>
												{convo.question.title}
											</h3>
											<div className='qa-timeline__video'>
												<div className='qa-timeline__video-placeholder'>
													<div className='qa-timeline__video-lines'>
														<div className='qa-timeline__video-line' />
														<div className='qa-timeline__video-line qa-timeline__video-line--short' />
														<div className='qa-timeline__video-line' />
														<div className='qa-timeline__video-line qa-timeline__video-line--short' />
													</div>
												</div>
												<div className='qa-timeline__play-overlay'>
													<div className='qa-timeline__play-btn'>
														<PlayIcon />
													</div>
												</div>
											</div>
											<p className='qa-timeline__card-text'>
												{convo.question.text}
											</p>
											<span className='qa-timeline__meta'>
												by {convo.question.student} at {convo.question.date}
											</span>
											<button
												type='button'
												className='qa-timeline__watch qa-timeline__watch--question'
											>
												Watch Question
												<PlayIconSmall />
											</button>
										</div>

										<div className='qa-timeline__connector'>
											<div className='qa-timeline__badge'>
												<QuestionBadge />
											</div>
											<div className='qa-timeline__line' />
											<div className='qa-timeline__badge'>
												<AnswerBadge />
											</div>
										</div>

										<div className='qa-timeline__card qa-timeline__card--answer'>
											<span className='qa-timeline__tag qa-timeline__tag--answer'>
												Teacher Answer
											</span>
											<div className='qa-timeline__video'>
												<div className='qa-timeline__video-placeholder'>
													<div className='qa-timeline__video-lines'>
														<div className='qa-timeline__video-line' />
														<div className='qa-timeline__video-line qa-timeline__video-line--short' />
														<div className='qa-timeline__video-line' />
														<div className='qa-timeline__video-line qa-timeline__video-line--short' />
													</div>
												</div>
												<div className='qa-timeline__play-overlay'>
													<div className='qa-timeline__play-btn'>
														<PlayIcon />
													</div>
												</div>
											</div>
											<p className='qa-timeline__card-text'>
												{convo.answer.text}
											</p>
											<span className='qa-timeline__meta'>
												by {convo.answer.teacher} at {convo.answer.date}
											</span>
											<button
												type='button'
												className='qa-timeline__watch qa-timeline__watch--answer'
											>
												Watch Answer
												<PlayIconSmall />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherOldQuestionsScreen
