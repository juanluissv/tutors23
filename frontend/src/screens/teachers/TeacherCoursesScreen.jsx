import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetCoursesBySubjectForTeacherQuery,
	useGetSubjectsByTeacherIdQuery,
} from '../../slices/teachers/teacherApiSlice'
import { TeacherCoursesGrid } from './TeacherCoursesGrid'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function TeacherCoursesScreen () {
	const navigate = useNavigate()
	const { id: subjectId } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const subjectIdOk =
		subjectId !== undefined && isValidObjectId(String(subjectId))

	const {
		data: subjects = [],
	} = useGetSubjectsByTeacherIdQuery(teacherId, { skip: !teacherId })

	const subjectTitle = useMemo(() => {
		if (!subjectIdOk || !Array.isArray(subjects)) {
			return null
		}
		const s = subjects.find((x) => String(x._id) === String(subjectId))
		return s?.title ? String(s.title) : null
	}, [subjects, subjectId, subjectIdOk])

	const {
		data: courses = [],
		isLoading,
		isError,
		refetch,
	} = useGetCoursesBySubjectForTeacherQuery(subjectId, {
		skip: !teacherId || !subjectIdOk,
	})

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

	if (!subjectIdOk) {
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
							<div className='teacher-subjects-page'>
								<p className='teacher-subjects-page__subtitle'>
									Invalid subject link.
								</p>
								<p className='teacher-subjects-page__subtitle'>
									<Link to='/teachers/subjects'>
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
						<TeacherCoursesGrid
							pageTitle={pageTitle}
							pageSubtitle={
								'Your courses for this subject. Add sections ' +
								'and lessons from the course editor when ' +
								'you are ready.'
							}
							backLink={{
								to: '/teachers/subjects',
								label: '← Back to my subjects',
							}}
							emptyMessage={
								'No courses yet for this subject. Use Create ' +
								'course in the sidebar to add one.'
							}
							courses={courses}
							isLoading={isLoading}
							isError={isError}
							refetch={refetch}
							renderCardActions={(course) => (
								<div className='teacher-subject-card__row'>
									<Link
										to={
											`/teachers/courses/${String(course._id)}/preview`
										}
										className='teacher-subject-card__btn'
									>
										Preview
									</Link>
									<Link
										to={
											`/teachers/courses/${String(course._id)}/`
											+ 'addlessons'
										}
										className='teacher-subject-card__btn'
									>
										Add lessons & sections
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

export default TeacherCoursesScreen
