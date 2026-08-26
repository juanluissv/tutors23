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
	getSelectSubjectsPath,
	getStudentSubjectsEmptyMessage,
	getSubscriptionBlockReason,
	subscriptionNeedsSubjectSelection,
} from '../../utils/subscriptionAccess'
import '../../App.css'

function StudentSubjectCardActions ({
	subject,
	canViewCourses,
	viewBlockReason,
}) {
	const subjectId = String(subject._id)
	const courses = Array.isArray(subject.courses) ? subject.courses : []
	return (
		<>
			{courses.length > 0 ? (
				<div className=''>
					{/* <p className='student-subject-courses__label'>
						Courses to watch
					</p>
					<ul>
						{courses.map((c) => (
							<li key={String(c._id)}>
								<Link
									to={`/students/watchcourse/${String(c._id)}`}
								>
									{c.title || 'Course'}
								</Link>
							</li>
						))}
					</ul> */}
				</div>
			) : null}
			<div className='teacher-subject-card__row'>
				{canViewCourses ? (
					<Link
						to={`/students/courses/${subjectId}`}
						className='teacher-subject-card__btn'
					>
						Ver cursos
					</Link>
				) : (
					<span
						className={
							'teacher-subject-card__btn ' +
							'teacher-subject-card__btn--disabled'
						}
						title={viewBlockReason || undefined}
					>
						Ver cursos
					</span>
				)}
				<Link
					to={`/students/viewbook/${subjectId}`}
					className='teacher-subject-card__btn'
				>
					Abrir libro
				</Link>
				{/* <Link
					to={`/students/asknewquestion?subject=${subjectId}`}
					className='teacher-subject-card__btn'
				>
					Ask a question
				</Link> */}
			</div>
		</>
	)
}

function StudentMySubjects () {
	const navigate = useNavigate()
	const { studentInfo } = useSelector((state) => state.authStudent)

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
	const canViewCourses = canViewQuestions(currentSubscription)
	const viewBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'view',
	)
	const needsSelection = subscriptionNeedsSubjectSelection(
		currentSubscription,
	)
	const selectSubjectsPath = getSelectSubjectsPath(
		currentSubscription,
	)

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetMySubjectsQuery(undefined, {
		skip: !studentInfo,
	})

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent('/students/mysubjects')
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate])

	useEffect(() => {
		if (
			!isLoadingProfile
			&& needsSelection
			&& selectSubjectsPath
		) {
			navigate(selectSubjectsPath, { replace: true })
		}
	}, [
		isLoadingProfile,
		needsSelection,
		selectSubjectsPath,
		navigate,
	])

	if (!studentInfo) {
		return null
	}

	const showSubscriptionNotice =
		!isLoadingProfile && !canViewCourses

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
							<StudentSubscriptionNotice
								subscription={currentSubscription}
							/>
						) : null}
						<TeacherSubjectsGrid
							pageTitle='Mis materias'
							pageSubtitle={
								'Materias en las que estás inscrito. Abre '
								+ 'una materia para seguir aprendiendo o '
								+ 'preguntarle a tu profesor.'
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
								noTeacher: 'Sin profesor',
								teacherPrefix: 'profesor  ',
							}}
							showStudentCount={false}
							showSubjectMeta={false}
							showTeacherName={true}
							emptyMessage={getStudentSubjectsEmptyMessage(
								currentSubscription,
							)}
							subjects={subjects}
							isLoading={isLoading || isLoadingProfile}
							isError={isError}
							refetch={refetch}
							renderCardActions={(subject) => (
								<StudentSubjectCardActions
									subject={subject}
									canViewCourses={canViewCourses}
									viewBlockReason={viewBlockReason}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentMySubjects
