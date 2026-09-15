import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGetCoursesBySubjectForSchoolAdminQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import { TeacherCoursesGrid } from '../teachers/TeacherCoursesGrid'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function resolveSchoolId (school) {
	if (!school) {
		return null
	}
	if (typeof school === 'string') {
		return school
	}
	if (typeof school === 'object' && school._id) {
		return String(school._id)
	}
	return null
}

function SchoolAdminCoursesScreen () {
	const navigate = useNavigate()
	const { id: subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const subjectIdOk =
		subjectId !== undefined && isValidObjectId(String(subjectId))

	const {
		data: subjects = [],
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const subjectTitle = useMemo(() => {
		if (!subjectIdOk || !Array.isArray(subjects)) {
			return null
		}
		const subject = subjects.find(
			(item) => String(item._id) === String(subjectId),
		)
		return subject?.title ? String(subject.title) : null
	}, [subjects, subjectId, subjectIdOk])

	const {
		data: courses = [],
		isLoading,
		isError,
		refetch,
	} = useGetCoursesBySubjectForSchoolAdminQuery(subjectId, {
		skip: !schoolAdminInfo || !subjectIdOk,
	})

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	if (!schoolAdminInfo) {
		return null
	}

	if (!subjectIdOk) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<AdminHeader
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area'>
							<div className='teacher-subjects-page'>
								<p className='teacher-subjects-page__subtitle'>
									Enlace de materia no válido.
								</p>
								<p className='teacher-subjects-page__subtitle'>
									<Link to='/schooladmins/mysubjects'>
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

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<TeacherCoursesGrid
							pageTitle={pageTitle}
							pageSubtitle={
								'Todos los cursos de esta materia. Los '
								+ 'profesores crean y administran el '
								+ 'contenido desde su cuenta.'
							}
							backLink={{
								to: '/schooladmins/mysubjects',
								label: '← Volver a mis materias',
							}}
							emptyMessage={
								'Aún no hay cursos para esta materia. Los '
								+ 'profesores asignados pueden crear cursos '
								+ 'desde su portal.'
							}
							courses={courses}
							isLoading={isLoading}
							isError={isError}
							refetch={refetch}
							renderCardActions={(course) => (
								<div className='teacher-subject-card__row'>
									<Link
										to={`/schooladmins/courses/${String(course._id)}/preview`}
										className='teacher-subject-card__btn'
									>
										Ver curso
									</Link>
								</div>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminCoursesScreen
