import React, {
	useEffect,
	useMemo,
	useState,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetCoursePreviewForTeacherQuery,
	useUpdateCoursePublishMutation,
} from '../../slices/teachers/teacherApiSlice'
import { buildSectionGroups, lessonKey } from '../../utils/courseOutline'
import './TeacherPreviewCourseScreen.css'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function subjectIdFromCourse (course) {
	if (!course?.subject) {
		return undefined
	}
	const s = course.subject
	if (typeof s === 'object' && s !== null && s._id != null) {
		return String(s._id)
	}
	return String(s)
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

function TeacherPreviewCourseScreen () {
	const navigate = useNavigate()
	const { id: courseIdRaw } = useParams()
	const courseId =
		courseIdRaw !== undefined ? String(courseIdRaw) : ''
	const courseIdOk = isValidObjectId(courseId)

	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const {
		data: course,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetCoursePreviewForTeacherQuery(courseId, {
		skip: !courseIdOk,
	})

	const [updateCoursePublish, { isLoading: isUpdatingPublish }] =
		useUpdateCoursePublishMutation()

	const subjectIdCache = subjectIdFromCourse(course)
	const isCoursePublished = course?.isPublish === true

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
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

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

	const handleSetPublish = async (nextPublish) => {
		try {
			await updateCoursePublish({
				courseId,
				isPublish: nextPublish,
				subjectId: subjectIdCache,
			}).unwrap()
			toast.success(
				nextPublish
					? 'Course is now published for students.'
					: 'Course is back in draft. Students can no longer open it.',
			)
		}
		catch (err) {
			const msg = err?.data?.message
				|| err?.error
				|| 'Could not update publish status.'
			toast.error(msg)
		}
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
						<div className='center-content2 course-preview'>
							{!courseIdOk && (
								<p className='course-preview__alert'>
									Invalid course link.
								</p>
							)}
							{courseIdOk && isLoading && (
								<p className='course-preview__muted'>
									Loading preview…
								</p>
							)}
							{courseIdOk && isError && (
								<div className='course-preview__alert-block'>
									<p>
										{error?.data?.message
											|| error?.error
											|| 'Could not load this course.'}
									</p>
									<button
										type='button'
										className='course-preview__btn course-preview__btn--ghost'
										onClick={() => refetch()}
									>
										Try again
									</button>
								</div>
							)}
							{courseIdOk && !isLoading && !isError && course && (
								<div className='course-preview__shell'>
									<header className='course-preview__toolbar'>
										<div>
											<div className='course-preview__title-row'>
												<p className='course-preview__eyebrow'>
													Course preview
												</p>
												<span
													className={
														'course-preview__status-badge '
														+ (isCoursePublished
															? 'course-preview__status-badge--live'
															: 'course-preview__status-badge--draft')
													}
												>
													{isCoursePublished
														? 'Published'
														: 'Draft'}
												</span>
											</div>
											<h1 className='course-preview__course-title'>
												{course.title}
											</h1>
											{course.description && (
												<p className='course-preview__desc'>
													{course.description}
												</p>
											)}
										</div>
										<div className='course-preview__toolbar-actions'>
											<Link
												to={
													`/teachers/courses/${courseId}/addlessons`
												}
												className='course-preview__btn course-preview__btn--primary'
											>
												Add lessons
											</Link>
											{isCoursePublished ? (
												<button
													type='button'
													className='course-preview__btn course-preview__btn--ghost'
													disabled={isUpdatingPublish}
													onClick={() =>
														void handleSetPublish(false)}
												>
													{isUpdatingPublish
														? 'Updating…'
														: 'Unpublish course'}
												</button>
											) : (
												<button
													type='button'
													className='course-preview__btn course-preview__btn--secondary'
													disabled={isUpdatingPublish}
													onClick={() =>
														void handleSetPublish(true)}
												>
													{isUpdatingPublish
														? 'Updating…'
														: 'Publish course'}
												</button>
											)}
										</div>
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
																		Video URL is not
																		available. Check S3
																		configuration or
																		public base URL.
																	</p>
																)
																: (
																	<p>
																		Select a lesson
																		from the outline
																		to preview it.
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
													No sections yet. Add sections and
													lessons to build your course.
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

export default TeacherPreviewCourseScreen
