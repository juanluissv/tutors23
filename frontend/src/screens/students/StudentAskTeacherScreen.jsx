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
import StudentSubscriptionNotice from '../../components/StudentSubscriptionNotice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	canAskNewQuestion,
	getStudentSubjectsEmptyMessage,
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
					 Preguntas anteriores
				</Link>
			) : (
				<span
					className={
						'teacher-subject-card__btn ' +
						'teacher-subject-card__btn--disabled'
					}
					title={viewBlockReason || undefined}
				>
					 Preguntas anteriores
				</span>
			)}
			{canAsk ? (
				<Link
					to={`/students/asknewquestion?subject=${subjectId}`}
					className='teacher-subject-card__btn'
				>
					Preguntarle a tu profesor
				</Link>
			) : (
				<span
					className={
						'teacher-subject-card__btn ' +
						'teacher-subject-card__btn--disabled'
					}
					title={askBlockReason || undefined}
				>
					Preguntarle a tu profesor
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
		<div className='chat-app ask-screen chat-app--student-subject-cards'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						{showSubscriptionNotice ? (
							<StudentSubscriptionNotice
								subscription={currentSubscription}
							/>
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
									No quedan preguntas
								</p>
								<p className='ask-subscription-notice__text'>
									{askBlockReason}
									{' '}
									Aún puedes revisar las preguntas
									anteriores.
								</p>
							</div>
						) : null}
						<TeacherSubjectsGrid
							pageTitle='Pregúntale a tu profesor'
							pageSize={5}
							pageSubtitle={
								'Selecciona una materia para preguntarle a tu profesor'
							}
							copy={{
								loading: 'Cargando materias…',
								error:
									'No pudimos cargar tus materias. '
									+ 'Intenta de nuevo en un momento.',
								retry: 'Intentar de nuevo',
								students: 'estudiantes',
								published: 'Publicado',
								draft: 'Borrador',
								paginationAria: 'Páginas de materias',
								showing: 'Mostrando',
								of: 'de',
								subjects: 'materias',
								prev: 'Anterior',
								next: 'Siguiente',
								pageAriaPrefix: 'Página',
							}}
							afterSubtitle={
								!isLoadingProfile && currentSubscription ? (
									<div className='ask-questions-left'>
										<span className='ask-questions-left__label'>
										 Preguntas disponibles 
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
												{questionsAsked} usadas ·{' '}
												{totalQuestions} en total
											</span>
										) : null}
									</div>
								) : null
							}
							emptyMessage={getStudentSubjectsEmptyMessage(
								currentSubscription,
							)}
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
