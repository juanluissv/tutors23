import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetSubjectsByTeacherIdQuery } from '../../slices/teachers/teacherApiSlice'
import { isUniversitySchool } from '../../utils/schoolType'
import {
	TeacherSubjectsGrid,
	SubjectCardActionsStudents,
} from './TeacherSubjectsGrid'
import Loader from '../../components/Loader'
import '../../App.css'

function TeacherStudentsBySubjectScreen () {
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
						{isLoading ? (
							<div className='teacher-subjects-page'>
								<h1 className='teacher-subjects-page__title heading-gradient'>
									Estudiantes por materia
								</h1>
								<div
									className='new-answers__status new-answers__status--loading'
									role='status'
									aria-live='polite'
									aria-busy='true'
								>
									<Loader size='md' />
									<p>Cargando materias…</p>
								</div>
							</div>
						) : (
							<TeacherSubjectsGrid
								pageTitle='Estudiantes por materia'
								pageSubtitle={
									'Elige una materia para ver los '
									+ 'estudiantes inscritos y su actividad.'
								}
								emptyMessage={
									'Aún no tienes materias. Cuando un '
									+ 'administrador escolar te asigne a '
									+ 'materias, aparecerán aquí.'
								}
								subjects={subjects}
								isLoading={false}
								isError={isError}
								refetch={refetch}
								isUniversity={isUniversity}
								renderCardActions={(subject) => (
									<SubjectCardActionsStudents
										subjectId={String(subject._id)}
									/>
								)}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherStudentsBySubjectScreen
