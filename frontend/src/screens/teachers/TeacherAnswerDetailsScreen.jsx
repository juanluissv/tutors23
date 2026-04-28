import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

const TagIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M4 4v7.17a2 2 0 00.59 1.42l8.82 8.82a2 2 0 002.83 0l5.17-5.17a2 2 0 000-2.83L12.59 4.59A2 2 0 0011.17 4H4z'
			fill='url(#ans-tag-fill)'
		/>
		<circle cx='8.5' cy='8.5' r='1.5' fill='white' />
		<defs>
			<linearGradient
				id='ans-tag-fill'
				x1='4'
				y1='4'
				x2='22'
				y2='22'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#818cf8' />
				<stop offset='1' stopColor='#6366f1' />
			</linearGradient>
		</defs>
	</svg>
)

const DescriptionIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect
			x='3'
			y='4'
			width='18'
			height='16'
			rx='3'
			fill='url(#ans-desc-fill)'
		/>
		<path
			d='M7 9h10M7 13h7'
			stroke='white'
			strokeWidth='1.8'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='ans-desc-fill'
				x1='3'
				y1='4'
				x2='21'
				y2='20'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#fb923c' />
				<stop offset='1' stopColor='#f97316' />
			</linearGradient>
		</defs>
	</svg>
)

const VideoUploadIcon = () => (
	<svg
		width='36'
		height='36'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect
			x='2'
			y='5'
			width='15'
			height='14'
			rx='3'
			fill='url(#ans-vid-fill)'
		/>
		<path
			d='M17 9l4-2v10l-4-2V9z'
			fill='url(#ans-vid-lens)'
		/>
		<path
			d='M9.5 9v6M6.5 12h6'
			stroke='white'
			strokeWidth='1.6'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='ans-vid-fill'
				x1='2'
				y1='5'
				x2='17'
				y2='19'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#7dd3fc' />
				<stop offset='1' stopColor='#0ea5e9' />
			</linearGradient>
			<linearGradient
				id='ans-vid-lens'
				x1='17'
				y1='7'
				x2='21'
				y2='17'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#38bdf8' />
				<stop offset='1' stopColor='#0284c7' />
			</linearGradient>
		</defs>
	</svg>
)

const demoQuestion = {
	title: 'how to create Custom audience ?',
}

function TeacherAnswerDetailsScreen () {
	const videoInputRef = useRef(null)
	const navigate = useNavigate()
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title] = useState(demoQuestion.title)
	const [description, setDescription] = useState('')
	const [videoFile, setVideoFile] = useState(null)
	const [isUploading, setIsUploading] = useState(false)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleVideoChange = (e) => {
		const file = e.target.files?.[0] ?? null
		setVideoFile(file)
	}

	const handleClearVideo = () => {
		setVideoFile(null)
		if (videoInputRef.current) {
			videoInputRef.current.value = ''
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()		
		setIsUploading(true)
		navigate('/teachers/answer')
		// try {
		// 	await new Promise((r) => setTimeout(r, 600))
		// 	toast.success(
		// 		'Answer saved — video will upload when the API is wired.',
		// 	)
		// } finally {
		// 	setIsUploading(false)
		// }
	}

	return (
		<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card logg2'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='login-card__back'>
										<Link
											to='/teachers/watchnew'
											className='login-card__link'
										>
											&#8592; Back to question
										</Link>
									</div>
									<h1 className='login-card__title answer-details__title'>
										Answer New Question
									</h1>
								</div>

								<form
									className='login-form'
									id='teacher-answer-form'
									name='teacher-answer-form'
									onSubmit={handleSubmit}
								>
									<div className='answer-details__field'>
										<div className='answer-details__icon answer-details__icon--purple'>
											<TagIcon />
										</div>
										<input
											type='text'
											id='answer-title'
											name='title'
											className='answer-details__input'
											value={title}
											readOnly
										/>
									</div>

									<div className='answer-details__field'>
										<div className='answer-details__icon answer-details__icon--orange'>
											<DescriptionIcon />
										</div>
										<textarea
											id='answer-description'
											name='description'
											className='answer-details__input answer-details__textarea'
											placeholder='Description'
											rows={4}
											value={description}
											disabled={isUploading}
											onChange={(e) =>
												setDescription(e.target.value)}
										/>
									</div>
									

									<button
										type='submit'
										className='answer-details__submit'
										disabled={isUploading}
									>
										{isUploading
											? 'Uploading…'
											: 'Upload Video'}
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherAnswerDetailsScreen
