import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetMySubjectsQuery,
	useGetStudentSubjectCoursesQuery,
	useGetProfileQuery,
} from '../../slices/student/studentApiSlice'
import { TeacherCoursesGrid } from '../teachers/TeacherCoursesGrid'
import StudentSubscriptionNotice from '../../components/StudentSubscriptionNotice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function StudentCoursesScreen () {
	const navigate = useNavigate()
	const location = useLocation()
	const { subjectId: subjectIdParam } = useParams()
	const subjectId =
		subjectIdParam !== undefined ? String(subjectIdParam) : ''
	const subjectIdOk = isValidObjectId(subjectId)

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
	const canView = canViewQuestions(currentSubscription)
	const viewBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'view',
	)

	const { data: subjects = [] } = useGetMySubjectsQuery(undefined, {
		skip: !studentInfo,
	})

	const subjectTitle = useMemo(() => {
		if (!subjectIdOk || !Array.isArray(subjects)) {
			return null
		}
		const s = subjects.find((x) => String(x._id) === subjectId)
		return s?.title ? String(s.title) : null
	}, [subjects, subjectId, subjectIdOk])

	const {
		data: courses = [],
		isLoading,
		isError,
		refetch,
	} = useGetStudentSubjectCoursesQuery(subjectId, {
		skip: !studentInfo || !subjectIdOk || isLoadingProfile || !canView,
	})

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent(
				`${location.pathname}${location.search}`,
			)
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate, location.pathname, location.search])

	if (!studentInfo) {
		return null
	}

	if (!subjectIdOk) {
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
							<div className='teacher-subjects-page'>
								<p className='teacher-subjects-page__subtitle'>
									Enlace de materia no válido.
								</p>
								<p className='teacher-subjects-page__subtitle'>
									<Link to='/students/mysubjects'>
										Volver a mis materias
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const pageTitle = subjectTitle
		? `Cursos · ${subjectTitle}`
		: 'Cursos'

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
						<TeacherCoursesGrid
							pageTitle={pageTitle}
							pageSubtitle={
								'Cursos publicados de esta materia. Puedes '
								+ 'ver las lecciones de estos cursos'
							}
							copy={{
								loading: 'Cargando cursos…',
								error:
									'No pudimos cargar los cursos de esta '
									+ 'materia. Puede que no tengas acceso, '
									+ 'o que haya un problema de red.',
								retry: 'Intentar de nuevo',
								published: 'Publicado',
								draft: 'Borrador',
							}}
							emptyMessage={
								canView
									? (
										'Aún no hay cursos publicados para '
										+ 'esta materia. Vuelve más tarde, o '
										+ 'revisa los enlaces que tu profesor '
										+ 'te haya compartido.'
									)
									: (
										viewBlockReason
										|| (
											'Suscríbete para desbloquear el '
											+ 'acceso a los cursos de esta '
											+ 'materia.'
										)
									)
							}
							courses={courses}
							isLoading={isLoading || isLoadingProfile}
							isError={isError}
							refetch={refetch}
							renderCardActions={(course) => (
								canView ? (
									<Link
										to={`/students/watchcourse/${String(
											course._id,
										)}`}
										className={
											'teacher-subject-card__btn ' +
											'teacher-subject-card__btn--wide'
										}
									>
										Ver curso
									</Link>
								) : (
									<span
										className={
											'teacher-subject-card__btn ' +
											'teacher-subject-card__btn--wide ' +
											'teacher-subject-card__btn--disabled'
										}
										title={viewBlockReason || undefined}
									>
										Ver curso
									</span>
								)
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentCoursesScreen
