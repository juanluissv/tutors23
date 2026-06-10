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

	const showSubscriptionNotice =
		!isLoadingProfile && !canView

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
							<div className='ask-subscription-notice'>
								<p className='ask-subscription-notice__title'>
									Subscription required
								</p>
								<p className='ask-subscription-notice__text'>
									{viewBlockReason}
								</p>
								<Link
									to='/students/subscription'
									className='ask-subscription-notice__link'
								>
									View plans & subscribe
								</Link>
							</div>
						) : null}
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
								canView
									? (
										'There are no published courses for this subject ' +
										'yet. Check back later, or browse any links your ' +
										'teacher shared with you.'
									)
									: (
										'Subscribe to unlock course access for this subject.'
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
										Watch course
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
										Watch course
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
