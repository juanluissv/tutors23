import React, {
	useEffect,
	useMemo,
	useState,
} from 'react'
import {
	Link,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetCourseWatchForStudentQuery,
	useGetProfileQuery,
} from '../../slices/student/studentApiSlice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
import { buildSectionGroups, lessonKey } from '../../utils/courseOutline'
import '../teachers/TeacherPreviewCourseScreen.css'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function PlayGlyph () {
	return (
		<svg
			className='course-preview__play-icon'
			width='14'
			height='14'
			viewBox='0 0 24 24'
			fill='currentColor'
			aria-hidden
		>
			<path d='M8 5v14l11-7L8 5z' />
		</svg>
	)
}

function ChevronGlyph ({ expanded }) {
	return (
		<svg
			className={`course-preview__chevron ${expanded
				? 'course-preview__chevron--open'
				: ''}`}
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2.2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden
		>
			<polyline points='6 9 12 15 18 9' />
		</svg>
	)
}

function StudentWatchCourseSreen () {
	const navigate = useNavigate()
	const location = useLocation()
	const { courseId: courseIdRaw } = useParams()
	const courseId =
		courseIdRaw !== undefined ? String(courseIdRaw) : ''
	const courseIdOk = isValidObjectId(courseId)

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

	const {
		data: course,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetCourseWatchForStudentQuery(courseId, {
		skip: !courseIdOk || !studentInfo || isLoadingProfile || !canView,
	})

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [expandedSections, setExpandedSections] = useState(() => ({}))
	const [selectedLessonKey, setSelectedLessonKey] = useState(null)

	const sectionGroups = useMemo(
		() => (course ? buildSectionGroups(course) : []),
		[course],
	)

	const firstLesson = useMemo(() => {
		for (const g of sectionGroups) {
			if (g.lessons[0]) {
				return g.lessons[0]
			}
		}
		return null
	}, [sectionGroups])

	const firstLessonKey = firstLesson ? lessonKey(firstLesson) : null

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent(
				`${location.pathname}${location.search}`,
			)
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate, location.pathname, location.search])

	useEffect(() => {
		setSelectedLessonKey(null)
		setExpandedSections({})
	}, [courseId])

	useEffect(() => {
		if (!firstLessonKey) {
			return
		}
		setSelectedLessonKey((prev) => (prev == null ? firstLessonKey : prev))
	}, [firstLessonKey])

	useEffect(() => {
		if (sectionGroups.length === 0) {
			return
		}
		setExpandedSections((prev) => {
			if (Object.keys(prev).length > 0) {
				return prev
			}
			const next = {}
			sectionGroups.forEach((g, i) => {
				if (g.lessons.length > 0) {
					next[g.sectionNumber] = i === 0
				}
			})
			return next
		})
	}, [sectionGroups])

	const selectedLesson = useMemo(() => {
		if (!course?.lessons || selectedLessonKey == null) {
			return null
		}
		return course.lessons.find((l) => lessonKey(l) === selectedLessonKey)
			?? null
	}, [course, selectedLessonKey])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleToggleSection = (sectionNumber) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionNumber]: !prev[sectionNumber],
		}))
	}

	const handleSelectLesson = (lesson) => {
		setSelectedLessonKey(lessonKey(lesson))
	}

	const errText = error?.data?.message
		|| error?.error
		|| (typeof error === 'string' ? error : null)
		|| 'Could not load this course.'

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
						<div className='center-content2 course-preview'>
							{!courseIdOk && (
								<p className='course-preview__alert'>
									Invalid course link.
								</p>
							)}
							{courseIdOk && !isLoadingProfile && !canView && (
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
									<div
										className='course-preview__toolbar-row'
										style={{ marginTop: '1rem' }}
									>
										<Link
											to='/students/mysubjects'
											className='course-preview__btn course-preview__btn--primary'
										>
											My subjects
										</Link>
									</div>
								</div>
							)}
							{courseIdOk && canView && isLoading && (
								<p className='course-preview__muted'>
									Loading course…
								</p>
							)}
							{courseIdOk && canView && isError && (
								<div className='course-preview__alert-block'>
									<p>{errText}</p>
									<div className='course-preview__toolbar-row'>
										<button
											type='button'
											className='course-preview__btn course-preview__btn--ghost'
											onClick={() => refetch()}
										>
											Try again
										</button>
										<Link
											to='/students/mysubjects'
											className='course-preview__btn course-preview__btn--primary'
										>
											My subjects
										</Link>
									</div>
								</div>
							)}
							{courseIdOk && canView && !isLoading && !isError && course && (
								<div className='course-preview__shell'>
									<header className='course-preview__toolbar'>
										<div>
											<p className='course-preview__eyebrow'>
												Your course
											</p>
											<h1 className='course-preview__course-title'>
												{course.title}
											</h1>
											{course.description && (
												<p className='course-preview__desc'>
													{course.description}
												</p>
											)}
										</div>
										<Link
											to='/students/mysubjects'
											className='course-preview__btn course-preview__btn--ghost'
										>
											← My subjects
										</Link>
									</header>

									<div className='course-preview__grid'>
										<main className='course-preview__main'>
											<div className='course-preview__video-card'>
												<div className='course-preview__video-frame'>
													{selectedLesson?.videoUrl ? (
														<video
															key={selectedLesson.videoUrl}
															className='course-preview__video'
															controls
															playsInline
															preload='metadata'
															src={selectedLesson.videoUrl}
														>
															Your browser does not support
															video playback.
														</video>
													) : (
														<div className='course-preview__video-placeholder'>
															{selectedLesson
																? (
																	<p>
																		This lesson&apos;s video
																		could not be loaded.
																		Try again later or
																		contact your teacher.
																	</p>
																)
																: (
																	<p>
																		Select a lesson from
																		the outline.
																	</p>
																)}
														</div>
													)}
												</div>
												<div className='course-preview__lesson-meta'>
													<h2 className='course-preview__lesson-title'>
														{selectedLesson?.title
															|| 'No lesson selected'}
													</h2>
													{selectedLesson?.description && (
														<p className='course-preview__lesson-body'>
															{selectedLesson.description}
														</p>
													)}
												</div>
											</div>
										</main>

										<aside
											className='course-preview__sidebar'
											aria-label='Course outline'
										>
											<div className='course-preview__sidebar-head'>
												<h2>Outline</h2>
												<p>
													{sectionGroups.reduce(
														(n, g) => n + g.lessons.length,
														0,
													)}{' '}
													lessons
												</p>
											</div>
											{sectionGroups.length === 0 && (
												<p className='course-preview__muted'>
													This course has no sections or
													lessons yet.
												</p>
											)}
											<ul className='course-preview__accordion'>
												{sectionGroups.map((group) => {
													const isOpen = Boolean(
														expandedSections[
															group.sectionNumber
														],
													)
													return (
														<li
															key={group.sectionNumber}
															className='course-preview__section'
														>
															<button
																type='button'
																className='course-preview__section-trigger'
																onClick={() =>
																	handleToggleSection(
																		group.sectionNumber,
																	)}
																aria-expanded={isOpen}
															>
																<span className='course-preview__section-label'>
																	{group.label}
																</span>
																<ChevronGlyph
																	expanded={isOpen}
																/>
															</button>
															{isOpen && (
																<ul className='course-preview__lesson-list'>
																	{group.lessons.length
																		=== 0 && (
																		<li className='course-preview__empty-section'>
																			No lessons in
																			this section
																		</li>
																	)}
																	{group.lessons.map(
																		(lesson) => {
																			const active =
																				lessonKey(
																					lesson,
																				)
																				=== selectedLessonKey
																			return (
																				<li
																					key={lessonKey(
																						lesson,
																					)}
																				>
																					<button
																						type='button'
																						className={`course-preview__lesson-row ${active
																							? 'course-preview__lesson-row--active'
																							: ''}`}
																						onClick={() =>
																							handleSelectLesson(
																								lesson,
																							)}
																					>
																						<PlayGlyph />
																						<span className='course-preview__lesson-name'>
																							{lesson.title
																								|| 'Untitled lesson'}
																						</span>
																					</button>
																				</li>
																			)
																		},
																	)}
																</ul>
															)}
														</li>
													)
												})}
											</ul>
										</aside>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentWatchCourseSreen
