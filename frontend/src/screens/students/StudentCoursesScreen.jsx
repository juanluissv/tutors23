import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetMySubjectsQuery,
	useGetStudentSubjectCoursesQuery,
} from '../../slices/student/studentApiSlice'
import { TeacherCoursesGrid } from '../teachers/TeacherCoursesGrid'
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
		skip: !studentInfo || !subjectIdOk,
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
			<div className='chat-app ask-screen'>
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
									Invalid subject link.
								</p>
								<p className='teacher-subjects-page__subtitle'>
									<Link to='/students/mysubjects'>
										Back to my subjects
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
		? `Courses · ${subjectTitle}`
		: 'Courses'

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
						<TeacherCoursesGrid
							pageTitle={pageTitle}
							pageSubtitle={
								'Published courses for this subject. You can ' +
								'watch lessons when your teacher marks a course ' +
								'as published.'
							}
							backLink={{
								to: '/students/mysubjects',
								label: '← Back to my subjects',
							}}
							emptyMessage={
								'There are no published courses for this subject ' +
								'yet. Check back later, or browse any links your ' +
								'teacher shared with you.'
							}
							courses={courses}
							isLoading={isLoading}
							isError={isError}
							refetch={refetch}
							renderCardActions={(course) => (
								<Link
									to={`/students/watchcourse/${String(
										course._id,
									)}`}
									className='teacher-subject-card__btn teacher-subject-card__btn--wide'
								>
									Watch course
								</Link>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentCoursesScreen
