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
									Invalid subject link.
								</p>
								<p className='teacher-subjects-page__subtitle'>
									<Link to='/schooladmins/mysubjects'>
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
								'All courses for this subject. Teachers create ' +
								'and manage course content from their account.'
							}
							backLink={{
								to: '/schooladmins/mysubjects',
								label: '← Back to my subjects',
							}}
							emptyMessage={
								'No courses yet for this subject. Assigned ' +
								'teachers can create courses from their portal.'
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
										Watch course
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
