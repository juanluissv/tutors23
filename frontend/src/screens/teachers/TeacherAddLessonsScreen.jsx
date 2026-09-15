import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useAddCourseLessonMutation,
	useAddCourseSectionMutation,
	useGetCourseByIdForTeacherQuery,
} from '../../slices/teachers/teacherApiSlice'
import { localizeApiError } from '../../utils/localizeApiMessage'
import './TeacherAddLessonsScreen.css'
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

function TagIcon () {
	return (
		<svg
			width='14'
			height='14'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2.2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden
		>
			<path d='M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l6.59-6.59a1 1 0 0 0 0-1.41L12 2Z' />
			<circle cx='7' cy='7' r='1.5' fill='currentColor' stroke='none' />
		</svg>
	)
}

function TeacherAddLessonsScreen () {
	const navigate = useNavigate()
	const { id: courseIdRaw } = useParams()
	const courseId =
		courseIdRaw !== undefined ? String(courseIdRaw) : ''
	const courseIdOk = isValidObjectId(courseId)
	const videoInputRef = useRef(null)

	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const {
		data: course,
		isLoading,
		isError,
		refetch,
	} = useGetCourseByIdForTeacherQuery(courseId, {
		skip: !courseIdOk,
	})

	const subjectIdCache = subjectIdFromCourse(course)

	const [sectionName, setSectionName] = useState('')
	const [lessonTitle, setLessonTitle] = useState('')
	const [lessonDescription, setLessonDescription] = useState('')
	const [lessonSectionNum, setLessonSectionNum] = useState('')
	const [videoLabel, setVideoLabel] = useState('')
	const [videoFile, setVideoFile] = useState(null)

	const [addCourseSection, { isLoading: isSavingSection }] =
		useAddCourseSectionMutation()
	const [addCourseLesson, { isLoading: isSavingLesson }] =
		useAddCourseLessonMutation()

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const sections = useMemo(() => {
		const raw = course?.sections
		return Array.isArray(raw) ? raw : []
	}, [course])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	useEffect(() => {
		if (!lessonSectionNum && sections.length > 0) {
			setLessonSectionNum(String(sections[0].sectionNumber ?? ''))
		}
	}, [sections, lessonSectionNum])

	useEffect(() => {
		setSectionName('')
		setLessonTitle('')
		setLessonDescription('')
		setLessonSectionNum('')
		setVideoLabel('')
		setVideoFile(null)
		if (videoInputRef.current) {
			videoInputRef.current.value = ''
		}
	}, [courseId])

	const backToSubjectCoursesHref = useMemo(() => {
		if (subjectIdCache && isValidObjectId(subjectIdCache)) {
			return `/teachers/courses/${subjectIdCache}`
		}
		return '/teachers/subjects'
	}, [subjectIdCache])

	const handlePickVideo = () => {
		videoInputRef.current?.click()
	}

	const handleVideoChange = (e) => {
		const file = e.target.files?.[0] ?? null
		setVideoFile(file)
		setVideoLabel(file ? file.name : '')
	}

	const handleAddSection = async (e) => {
		e.preventDefault()
		const trimmed = sectionName.trim()
		if (!trimmed) {
			toast.error('Ingresa un nombre de sección')
			return
		}

		try {
			await addCourseSection({
				courseId,
				sectionTitle: trimmed,
				subjectId: subjectIdCache,
			}).unwrap()
			toast.success('Sección agregada')
			setSectionName('')
			void refetch()
		}
		catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo agregar la sección'),
			)
		}
	}

	const handleAddLesson = async (e) => {
		e.preventDefault()
		if (sections.length === 0) {
			toast.error('Primero agrega al menos una sección')
			return
		}
		const t = lessonTitle.trim()
		if (!t) {
			toast.error('Ingresa el título de la lección')
			return
		}
		if (!lessonSectionNum) {
			toast.error('Elige una sección')
			return
		}
		if (!videoFile) {
			toast.error('Elige un archivo de video')
			return
		}

		try {
			await addCourseLesson({
				courseId,
				title: t,
				sectionNumber: lessonSectionNum,
				description: lessonDescription.trim(),
				video: videoFile,
				subjectId: subjectIdCache,
			}).unwrap()
			toast.success('Lección agregada')
			setLessonTitle('')
			setLessonDescription('')
			setVideoFile(null)
			setVideoLabel('')
			if (videoInputRef.current) {
				videoInputRef.current.value = ''
			}
			void refetch()
		}
		catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo agregar la lección'),
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	if (!courseIdOk) {
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
							<p className='course-builder__loading'>
								Enlace de curso no válido.{' '}
								<Link to='/teachers/subjects'>Mis materias</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const pageBusy = isSavingSection || isSavingLesson
	const lessonLocked = sections.length === 0 || pageBusy

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
							<p className='course-builder__loading'>
								Cargando curso…
							</p>
						) : isError || !course ? (
							<div className='course-builder__loading'>
								<p>No pudimos cargar este curso.</p>
								<button
									type='button'
									className='login-submit'
									style={{ maxWidth: 220, marginTop: 12 }}
									onClick={() => void refetch()}
								>
									Intentar de nuevo
								</button>
							</div>
						) : (
							<>
								<div className='course-builder'>
									<div className='course-builder__hero'>
										{/* <p className='course-builder__eyebrow'>
											Editor del curso
										</p> */}
										<h1 className='course-builder__title'>
											{course.title}
										</h1>
										{course.description ? (
											<p className='course-builder__sub'>
												{/* {course.description} */}
											</p>
										) : (
											<p className='course-builder__sub'>
												Primero agrega secciones y luego
												adjunta lecciones con video a
												cada una. Todo se guarda en tu
												curso a medida que avanzas.
											</p>
										)}
									</div>

									<div className='course-builder__layout'>
										<section
											className={
												'course-builder__panel ' +
												'course-builder__panel--sections'
											}
											aria-labelledby='course-builder-s1'
										>
											<div className={
												'course-builder__panel-inner'
											}
											>
												<h2
													id='course-builder-s1'
													className={
														'course-builder__step-label ' +
														'course-builder__step-label--violet'
													}
												>
													<span className={
														'course-builder__step-num ' +
														'course-builder__step-num--violet'
													}
													>
														1
													</span>
													Agregar sección del curso
												</h2>
												<p className='course-builder__help'>
													Crea el temario de tu curso
													(unidades, capítulos o
													módulos).
												</p>
												<form
													onSubmit={handleAddSection}
												>
													<div className={
														'course-builder__field'
													}
													>
														<span className={
															'course-builder__icon-well'
														}
														>
															<span className={
																'course-builder__icon-square ' +
																'course-builder__icon-square--violet'
															}
															>
																<TagIcon />
															</span>
														</span>
														<div className={
															'course-builder__input-wrap'
														}
														>
															<label
																className={
																	'course-builder__label'
																}
																htmlFor={
																	'cb-section-name'
																}
															>
																Nombre de la sección
															</label>
															<input
																id='cb-section-name'
																type='text'
																className={
																	'course-builder__input'
																}
																placeholder='Ej. Bienvenida y resumen'
																value={
																	sectionName
																}
																disabled={
																	pageBusy
																}
																autoComplete='off'
																onChange={(ev) =>
																	setSectionName(
																		ev.target.value,
																	)}
															/>
														</div>
													</div><br />
													{sections.length > 0 ? (
														<div className={
															'course-builder__sections-chips'
														}
														>
															{sections.map(
																(s) => (
																	<span
																		key={
																			String(
																				s.sectionNumber,
																			)
																		}
																		className={
																			'course-builder__chip'
																		}
																	>
																		{
																			s.sectionTitle
																		}
																	</span>
																),
															)}
														</div>
													) : null}
													<br /><button
														type='submit'
														className={
															'course-builder__btn ' +
															'course-builder__btn--violet'
														}
														disabled={
															isSavingSection
														}
													>
														{isSavingSection
															? 'Guardando…'
															: 'Agregar sección'}
													</button>
												</form>
											</div>
										</section>

										<section
											className={
												'course-builder__panel ' +
												'course-builder__panel--lessons'
											}
											aria-labelledby='course-builder-s2'
										>
											<div className={
												'course-builder__panel-inner'
											}
											>
												<h2
													id='course-builder-s2'
													className={
														'course-builder__step-label ' +
														'course-builder__step-label--cyan'
													}
												>
													<span className={
														'course-builder__step-num ' +
														'course-builder__step-num--cyan'
													}
													>
														2
													</span>
													Agregar lección
												</h2>
												<p className='course-builder__help'>
													Cuando ya exista una sección,
													graba o sube el video de la
													lección (WebM, MP4, MOV).
													Máximo unos 200 MB.
												</p>
												<form
													onSubmit={handleAddLesson}
												>
													<div className={
														'course-builder__field'
													}
													>
														<span className={
															'course-builder__icon-well'
														}
														>
															<span className={
																'course-builder__icon-square ' +
																'course-builder__icon-square--cyan'
															}
															>
																<TagIcon />
															</span>
														</span>
														<div className={
															'course-builder__input-wrap'
														}
														>
															<label
																className={
																	'course-builder__label'
																}
																htmlFor={
																	'cb-lesson-title'
																}
															>
																Título de la lección
															</label>
															<input
																id='cb-lesson-title'
																type='text'
																className={
																	'course-builder__input'
																}
																placeholder='Título de la lección'
																value={
																	lessonTitle
																}
																disabled={
																	lessonLocked
																}
																autoComplete='off'
																onChange={(ev) =>
																	setLessonTitle(
																		ev.target.value,
																	)}
															/>
														</div>
													</div><br />

													<div className={
														'course-builder__field'
													}
													>
														<span className={
															'course-builder__icon-well'
														}
														>
															<span className={
																'course-builder__icon-square ' +
																'course-builder__icon-square--cyan'
															}
															>
																<TagIcon />
															</span>
														</span>
														<div className={
															'course-builder__input-wrap'
														}
														>
															<label
																className={
																	'course-builder__label'
																}
																htmlFor={
																	'cb-lesson-section'
																}
															>
																Secciones del curso
															</label>
															<select
																id='cb-lesson-section'
																className={
																	'course-builder__input'
																}
																value={
																	lessonSectionNum
																}
																disabled={
																	lessonLocked
																}
																onChange={(ev) =>
																	setLessonSectionNum(
																		ev.target.value,
																	)}
															>
																<option value=''>
																	Elige una
																	sección
																</option>
																{sections.map(
																	(s) => (
																		<option
																			key={
																				String(s.sectionNumber)
																			}
																			value={
																				String(
																					s.sectionNumber,
																				)
																			}
																		>
																			{
																				s.sectionTitle
																			}
																		</option>
																	),
																)}
															</select>
														</div>
													</div><br />

													<div className={
														'course-builder__field ' +
														'course-builder__file-row'
													}
													>
														<span className={
															'course-builder__icon-well'
														}
														>
															<span className={
																'course-builder__icon-square ' +
																'course-builder__icon-square--cyan'
															}
															>
																<TagIcon />
															</span>
														</span>
														<div className={
															'course-builder__input-wrap'
														}
														>
															<label
																className={
																	'course-builder__label'
																}
															>
																Video de la lección
															</label>
															<div style={{ position: 'relative' }}>
																<input
																	ref={
																		videoInputRef
																	}
																	type='file'
																	name='video'
																	accept='video/*,.webm'
																	aria-label='Subir archivo de video de la lección'
																	style={{
																		position: (
																			'absolute'
																		),
																		width: '1px',
																		height: (
																			'1px'
																		),
																		padding: 0,
																		margin: (
																			'-1px'
																		),
																		overflow: (
																			'hidden'
																		),
																		clip: (
																			'rect(0, 0, 0, 0)'
																		),
																		whiteSpace: (
																			'nowrap'
																		),
																		border: 0,
																	}}
																	tabIndex={-1}
																	onChange={
																		handleVideoChange
																	}
																/>
															</div>
															<div className={
																'course-builder__field ' +
																'course-builder__file-trigger'
															}
															style={{
																alignItems: (
																	'center'),
															}}
															>
																<button
																	type='button'
																	className={
																		'course-builder__file-btn'
																	}
																	disabled={
																		lessonLocked
																	}
																	onClick={
																		handlePickVideo
																	}
																>
																	Elegir archivo
																</button>
																<span className={
																	'course-builder__file-meta'
																}
																>
																	{videoLabel
																		|| (
																			'Ningún archivo elegido'
																		)}
																</span>
															</div>
														</div>
													</div>

													<div className={
														'course-builder__field'
													}
													>
														<span className={
															'course-builder__icon-well'
														}
														/>
														<div className={
															'course-builder__input-wrap'
														}
														>
															<label
																className={
																	'course-builder__label'
																}
																htmlFor={
																	'cb-lesson-desc'
																}
															>
																Descripción
																{' '}
																<span
																	style={{
																		fontWeight: 400,
																		textTransform: (
																			'none'),
																		fontSize: (
																			'0.8125rem'),
																		color: (
																			'rgb(148 163 184)'),
																	}}
																>
																	(opcional)
																</span>
															</label>
															<textarea
																id='cb-lesson-desc'
																className={
																	'course-builder__input ' +
																	'course-builder__textarea'
																}
																placeholder='Notas breves para esta lección…'
																rows={3}
																value={
																	lessonDescription
																}
																disabled={
																	lessonLocked
																}
																onChange={(ev) =>
																	setLessonDescription(
																		ev.target.value,
																	)}
															/>
														</div>
													</div><br />

													<button
														type='submit'
														className={
															'course-builder__btn ' +
															'course-builder__btn--cyan'
														}
														disabled={lessonLocked}
													>
														{isSavingLesson
															? 'Subiendo…'
															: 'Agregar lección'}
													</button>
												</form>
											</div>
										</section>
									</div>
								</div>
								<p className='course-builder__back'>
									<Link to={backToSubjectCoursesHref}>
										← Volver a los cursos de esta materia
									</Link>
								</p>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherAddLessonsScreen
