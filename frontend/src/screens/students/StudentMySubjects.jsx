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
import {
	resolveCurrentSubscription,
	canViewQuestions,
	getSubscriptionBlockReason,
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
						Browse courses
					</Link>
				) : (
					<span
						className={
							'teacher-subject-card__btn ' +
							'teacher-subject-card__btn--disabled'
						}
						title={viewBlockReason || undefined}
					>
						Browse courses
					</span>
				)}
				<Link
					to={`/9/valores/unidad1/semana1`}
					className='teacher-subject-card__btn'
				>
					Open book
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
