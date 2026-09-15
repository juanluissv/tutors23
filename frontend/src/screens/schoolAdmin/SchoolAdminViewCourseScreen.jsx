import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { useGetCoursePreviewForSchoolAdminQuery } from '../../slices/admin/schoolAdminApiSlice'
import { buildSectionGroups, lessonKey } from '../../utils/courseOutline'
import '../teachers/TeacherPreviewCourseScreen.css'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function subjectIdFromCourse (course) {
	if (!course?.subject) {
		return undefined
	}
	const subject = course.subject
	if (typeof subject === 'object' && subject !== null && subject._id != null) {
		return String(subject._id)
	}
	return String(subject)
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
			className={`course-preview__chevron ${
				expanded ? 'course-preview__chevron--open' : ''
			}`}
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

function SchoolAdminViewCourseScreen () {
	const navigate = useNavigate()
	const { id: courseIdRaw } = useParams()
	const courseId =
		courseIdRaw !== undefined ? String(courseIdRaw) : ''
	const courseIdOk = isValidObjectId(courseId)

	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)

	const {
		data: course,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetCoursePreviewForSchoolAdminQuery(courseId, {
		skip: !courseIdOk || !schoolAdminInfo,
	})

	const subjectId = subjectIdFromCourse(course)
	const isCoursePublished = course?.isPublish === true
	const backToCoursesPath = subjectId
		? `/schooladmins/courses/${subjectId}`
		: '/schooladmins/mysubjects'

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [expandedSections, setExpandedSections] = useState(() => ({}))
	const [selectedLessonKey, setSelectedLessonKey] = useState(null)

	const sectionGroups = useMemo(
		() => (course
			? buildSectionGroups(course, {
				section: 'Sección',
				otherLessons: 'Otras lecciones',
			})
			: []),
		[course],
	)

	const firstLesson = useMemo(() => {
		for (const group of sectionGroups) {
			if (group.lessons[0]) {
				return group.lessons[0]
			}
		}
		return null
	}, [sectionGroups])

	const firstLessonKey = firstLesson ? lessonKey(firstLesson) : null
	const lessonCount = sectionGroups.reduce(
		(n, group) => n + group.lessons.length,
		0,
	)

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

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
			sectionGroups.forEach((group, index) => {
				if (group.lessons.length > 0) {
					next[group.sectionNumber] = index === 0
				}
			})
			return next
		})
	}, [sectionGroups])

	const selectedLesson = useMemo(() => {
		if (!course?.lessons || selectedLessonKey == null) {
			return null
		}
		return course.lessons.find((lesson) => lessonKey(lesson) === selectedLessonKey)
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

	if (!schoolAdminInfo) {
		return null
	}

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
						<div className='center-content2 course-preview'>
							{!courseIdOk && (
								<p className='course-preview__alert'>
									Enlace de curso no válido.
								</p>
							)}
							{courseIdOk && isLoading && (
								<p className='course-preview__muted'>
									Cargando curso…
								</p>
							)}
							{courseIdOk && isError && (
								<div className='course-preview__alert-block'>
									<p>
										{error?.data?.message
											|| error?.error
											|| 'No pudimos cargar este curso.'}
									</p>
									<button
										type='button'
										className='course-preview__btn course-preview__btn--ghost'
										onClick={() => refetch()}
									>
										Intentar de nuevo
									</button>
								</div>
							)}
							{courseIdOk && !isLoading && !isError && course && (
								<div className='course-preview__shell'>
									<header className='course-preview__toolbar'>
										<div>
											<div className='course-preview__title-row'>
												<p className='course-preview__eyebrow'>
													Visor del curso
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
														? 'Publicado'
														: 'Borrador'}
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
												to={backToCoursesPath}
												className='course-preview__btn course-preview__btn--ghost'
											>
												Volver a los cursos
											</Link>
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
															Tu navegador no admite la
															reproducción de video.
														</video>
													) : (
														<div className='course-preview__video-placeholder'>
															{selectedLesson
																? (
																	<p>
																		La URL del video no
																		está disponible.
																		Revisa la
																		configuración de S3
																		o la URL pública
																		base.
																	</p>
																)
																: (
																	<p>
																		Selecciona una
																		lección del temario
																		para verla.
																	</p>
																)}
														</div>
													)}
												</div>
												<div className='course-preview__lesson-meta'>
													<h2 className='course-preview__lesson-title'>
														{selectedLesson?.title
															|| 'Ninguna lección seleccionada'}
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
											aria-label='Temario del curso'
										>
											<div className='course-preview__sidebar-head'>
												<h2>Temario</h2>
												<p>
													{lessonCount}{' '}
													{lessonCount === 1
														? 'lección'
														: 'lecciones'}
												</p>
											</div>
											{sectionGroups.length === 0 && (
												<p className='course-preview__muted'>
													Aún no hay secciones. Los
													profesores pueden agregar
													secciones y lecciones desde su
													portal.
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
																			No hay lecciones
																			en esta sección
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
																						className={`course-preview__lesson-row ${
																							active
																								? 'course-preview__lesson-row--active'
																								: ''
																						}`}
																						onClick={() =>
																							handleSelectLesson(
																								lesson,
																							)}
																					>
																						<PlayGlyph />
																						<span className='course-preview__lesson-name'>
																							{lesson.title
																								|| 'Lección sin título'}
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

export default SchoolAdminViewCourseScreen
