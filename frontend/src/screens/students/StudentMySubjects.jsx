import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useGetMySubjectsQuery } from '../../slices/student/studentApiSlice'
import { TeacherSubjectsGrid } from '../teachers/TeacherSubjectsGrid'
import '../../App.css'

function StudentSubjectCardActions ({ subjectId }) {
	return (
		<div className='teacher-subject-card__row'>
			<Link
				to={`/9/valores/unidad1/semana1`}
				className='teacher-subject-card__btn'
			>
				Open subject
			</Link>
			<Link to='/ask' className='teacher-subject-card__btn'>
				Ask a question
			</Link>
		</div>
	)
}

function StudentMySubjects () {
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

	if (!studentInfo) {
		return null
	}

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
						<TeacherSubjectsGrid
							pageTitle='My subjects'
							pageSubtitle={
								'Courses you are enrolled in. Open a ' +
								'subject to continue learning or ask your ' +
								'tutor a question.'
							}
							emptyMessage={
								'You are not enrolled in any subjects yet. ' +
								'When a teacher adds you using your email, ' +
								'your subjects will appear here after you sign in.'
							}
							subjects={subjects}
							isLoading={isLoading}
							isError={isError}
							refetch={refetch}
							renderCardActions={(subject) => (
								<StudentSubjectCardActions
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

export default StudentMySubjects
