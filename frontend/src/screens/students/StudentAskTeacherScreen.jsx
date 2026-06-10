import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetMySubjectsQuery,
	useGetProfileQuery,
} from '../../slices/student/studentApiSlice'
import { TeacherSubjectsGrid } from '../teachers/TeacherSubjectsGrid'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	canAskNewQuestion,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
import '../../App.css'

function AskTeacherSubjectCardActions ({
	subjectId,
	canView,
	canAsk,
	viewBlockReason,
	askBlockReason,
}) {
	return (
		<div className='teacher-subject-card__row'>
			{canView ? (
				<Link
					to={`/students/previousquestions/${subjectId}`}
					className='teacher-subject-card__btn'
				>
					Previous questions
				</Link>
			) : (
				<span
					className={
						'teacher-subject-card__btn ' +
						'teacher-subject-card__btn--disabled'
					}
					title={viewBlockReason || undefined}
				>
					Previous questions
				</span>
			)}
			{canAsk ? (
				<Link
					to={`/students/asknewquestion?subject=${subjectId}`}
					className='teacher-subject-card__btn'
				>
					Ask a question
				</Link>
			) : (
				<span
					className={
						'teacher-subject-card__btn ' +
						'teacher-subject-card__btn--disabled'
					}
					title={askBlockReason || undefined}
				>
					Ask a question
				</span>
			)}
		</div>
	)
}

function StudentAskTeacherScreen () {
	const navigate = useNavigate()
	const { studentInfo } = useSelector((state) => state.authStudent)

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetMySubjectsQuery(undefined, {
		skip: !studentInfo,
	})

	const {
		data: profile,
		isLoading: isLoadingProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const currentSubscription = useMemo(
		() => resolveCurrentSubscription(profile?.subscriptions),
		[profile?.subscriptions],
	)

	const questionsAsked =
		Number(currentSubscription?.questionsAsked) || 0
	const totalQuestions =
		Number(currentSubscription?.totalQuestions) || 0
	const questionsLeft =
		Number(currentSubscription?.questionsLeft) || 0
	const canView = canViewQuestions(currentSubscription)
	const canAsk = canAskNewQuestion(currentSubscription)
	const viewBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'view',
	)
	const askBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'ask',
	)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent('/students/askteacher')
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate])

	if (!studentInfo) {
		return null
	}

	const showSubscriptionNotice =
		!isLoadingProfile && !canView

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
						{showSubscriptionNotice ? (
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
						{!showSubscriptionNotice
							&& !isLoadingProfile
							&& canView
							&& !canAsk ? (
							<div
								className={
									'ask-subscription-notice ' +
									'ask-subscription-notice--warning'
								}
							>
								<p className='ask-subscription-notice__title'>
									No questions remaining
								</p>
								<p className='ask-subscription-notice__text'>
									{askBlockReason}
									{' '}
									You can still review previous questions.
								</p>
							</div>
						) : null}
						<TeacherSubjectsGrid
							pageTitle='Ask your teacher'
							pageSubtitle={
								'Pick a subject to record and send a ' +
								'question to your tutor'
							}
							afterSubtitle={
								!isLoadingProfile && currentSubscription ? (
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
								) : null
							}
							emptyMessage={
								'You are not enrolled in any subjects yet. ' +
								'When a teacher adds you using your email, ' +
								'your subjects will appear here after you sign in.'
							}
							subjects={subjects}
							isLoading={isLoading || isLoadingProfile}
							isError={isError}
							refetch={refetch}
							renderCardActions={(subject) => (
								<AskTeacherSubjectCardActions
									subjectId={String(subject._id)}
									canView={canView}
									canAsk={canAsk}
									viewBlockReason={viewBlockReason}
									askBlockReason={askBlockReason}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentAskTeacherScreen
