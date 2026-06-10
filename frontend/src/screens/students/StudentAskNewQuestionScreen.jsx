import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useCreateStudentQuestionMutation } from '../../slices/student/questionsSlice'
import { useGetProfileQuery } from '../../slices/student/studentApiSlice'
import {
	resolveCurrentSubscription,
	canAskNewQuestion,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
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
			fill='url(#stu-q-tag-fill)'
		/>
		<circle cx='8.5' cy='8.5' r='1.5' fill='white' />
		<defs>
			<linearGradient
				id='stu-q-tag-fill'
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
			fill='url(#stu-q-desc-fill)'
		/>
		<path
			d='M7 9h10M7 13h7'
			stroke='white'
			strokeWidth='1.8'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='stu-q-desc-fill'
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

function StudentAskNewQuestionScreen () {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const subjectId = searchParams.get('subject')?.trim() || ''

	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	const [createStudentQuestion, { isLoading: isSubmitting }] =
		useCreateStudentQuestionMutation()

	const {
		data: profile,
		isLoading: isLoadingProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const currentSubscription = resolveCurrentSubscription(
		profile?.subscriptions,
	)
	const questionsAsked =
		Number(currentSubscription?.questionsAsked) || 0
	const totalQuestions =
		Number(currentSubscription?.totalQuestions) || 0
	const questionsLeft =
		Number(currentSubscription?.questionsLeft) || 0
	const canAsk = canAskNewQuestion(currentSubscription)
	const askBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'ask',
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent(
				`/students/asknewquestion${subjectId ? `?subject=${subjectId}` : ''}`,
			)
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate, subjectId])

	const handleSubmit = async (e) => {
		e.preventDefault()
		const titleTrim = title.trim()
		if (!subjectId) {
			toast.error('Choose a subject from My subjects first')
			return
		}
		if (!titleTrim) {
			toast.error('Please enter a title')
			return
		}
		try {
			const created = await createStudentQuestion({
				title: titleTrim,
				description: description.trim(),
				subject: subjectId,
			}).unwrap()
			toast.success('Your question was submitted')
			setTitle('')
			setDescription('')
			navigate(`/students/ask/${created._id}`)
		} catch (err) {
			toast.error(
				err?.data?.message || err?.error || 'Could not submit question',
			)
		}
	}

	if (!studentInfo) {
		return null
	}

	const canSubmit =
		Boolean(subjectId) && !isSubmitting && canAsk && !isLoadingProfile

	return (
		<div
			className={
				'chat-app  ask-screen'
			}
		>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area '>
						<div
							className={
								'center-content2 login-screen login-screen--wide'
							}
						>
							<div className='login-card logg2'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='login-card__back'>
										<Link
											to='/students/mysubjects'
											className='login-card__link'
										>
											&#8592; Back to my subjects
										</Link>
									</div>
									{!isLoadingProfile && currentSubscription ? (
										<div className='ask-questions-left'>
											<span className='ask-questions-left__label'>
												Questions left
											</span>
											<span
												className={
													'ask-questions-left__value' +
													(questionsLeft > 0
														? ' ask-questions-left__value--available'
														: ' ask-questions-left__value--empty')
												}
											>
												{questionsLeft}
											</span>
											{totalQuestions > 0 ? (
												<span className='ask-questions-left__meta'>
													{questionsAsked} used ·{' '}
													{totalQuestions} total
												</span>
											) : null}
										</div>
									) : null}
									<h1
										className={
											'login-card__title answer-details__title'
										}
									>
										Ask a new question
									</h1>
								</div>

								{!subjectId ? (
									<p className='login-card__subtitle'>
										Select a subject from{' '}
										<Link to='/students/mysubjects'>
											My subjects
										</Link>
										{' '}
										and use &quot;Ask a question&quot; on a
										course card so your question is routed to
										the right class.
									</p>
								) : null}

								{!isLoadingProfile && !canAsk ? (
									<div className='ask-subscription-notice'>
										<p className='ask-subscription-notice__title'>
											Cannot ask a new question
										</p>
										<p className='ask-subscription-notice__text'>
											{askBlockReason}
										</p>
										<Link
											to='/students/subscription'
											className='ask-subscription-notice__link'
										>
											View plans & subscribe
										</Link>
									</div>
								) : null}

								<form
									className='login-form'
									id='student-ask-question-form'
									name='student-ask-question-form'
									onSubmit={handleSubmit}
								>
									<div className='answer-details__field'>
										<div
											className={
												'answer-details__icon ' +
												'answer-details__icon--purple'
											}
										>
											<TagIcon />
										</div>
										<input
											type='text'
											id='student-question-title'
											name='title'
											className='answer-details__input'
											placeholder='Question title'
											autoComplete='off'
											value={title}
											disabled={isSubmitting}
											onChange={(e) =>
												setTitle(e.target.value)}
										/>
									</div>

									<div className='answer-details__field'>
										<div
											className={
												'answer-details__icon ' +
												'answer-details__icon--orange'
											}
										>
											<DescriptionIcon />
										</div>
										<textarea
											id='student-question-description'
											name='description'
											className={
												'answer-details__input ' +
												'answer-details__textarea'
											}
											placeholder='Description (optional)'
											rows={4}
											value={description}
											disabled={isSubmitting}
											onChange={(e) =>
												setDescription(e.target.value)}
										/>
									</div>

									<button
										type='submit'
										className='answer-details__submit'
										disabled={!canSubmit}
									>
										{isSubmitting
											? 'Submitting…'
											: 'Submit question'}
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

export default StudentAskNewQuestionScreen
