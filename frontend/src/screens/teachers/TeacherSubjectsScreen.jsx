import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetSubjectsByTeacherIdQuery } from '../../slices/teachers/teacherApiSlice'
import { isUniversitySchool } from '../../utils/schoolType'
import {
	TeacherSubjectsGrid,
	SubjectCardActionsDefault,
} from './TeacherSubjectsGrid'
import '../../App.css'

function TeacherSubjectsScreen () {
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null
	const isUniversity = isUniversitySchool(teacherInfo?.schoolType)

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetSubjectsByTeacherIdQuery(teacherId, { skip: !teacherId })

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	if (!teacherInfo) {
		return null
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
						<TeacherSubjectsGrid
							pageTitle='Mis materias'
							pageSubtitle={
								'Administra tus cursos, lecciones y las '
								+ 'preguntas anteriores de tus estudiantes.'
							}
							emptyMessage={
								'Aún no tienes materias. Cuando un '
								+ 'administrador escolar te invite por '
								+ 'correo, tus materias aparecerán aquí.'
							}
							subjects={subjects}
							isLoading={isLoading}
							isError={isError}
							refetch={refetch}
							isUniversity={isUniversity}
							renderCardActions={(subject) => (
								<SubjectCardActionsDefault
									subjectId={String(subject._id)}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherSubjectsScreen
