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
			toast.error('Enter a section name')
			return
		}

		try {
			await addCourseSection({
				courseId,
				sectionTitle: trimmed,
				subjectId: subjectIdCache,
			}).unwrap()
			toast.success('Section added')
			setSectionName('')
			void refetch()
		}
		catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not add section',
			)
		}
	}

	const handleAddLesson = async (e) => {
		e.preventDefault()
		if (sections.length === 0) {
			toast.error('Add at least one section first')
			return
		}
		const t = lessonTitle.trim()
		if (!t) {
			toast.error('Enter a lesson title')
			return
		}
		if (!lessonSectionNum) {
			toast.error('Choose a section')
			return
		}
		if (!videoFile) {
			toast.error('Choose a video file')
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
			toast.success('Lesson added')
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
				err?.data?.message
					|| err?.error?.message
					|| 'Could not add lesson',
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
								Invalid course link.{' '}
								<Link to='/teachers/subjects'>My subjects</Link>
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
								Loading course…
							</p>
						) : isError || !course ? (
							<div className='course-builder__loading'>
								<p>Could not load this course.</p>
								<button
									type='button'
									className='login-submit'
									style={{ maxWidth: 220, marginTop: 12 }}
									onClick={() => void refetch()}
								>
									Try again
								</button>
							</div>
						) : (
							<>
								<div className='course-builder'>
									<div className='course-builder__hero'>
										<p className='course-builder__eyebrow'>
											Course builder
										</p>
										<h1 className='course-builder__title'>
											{course.title}
										</h1>
										{course.description ? (
											<p className='course-builder__sub'>
												{/* {course.description} */}
											</p>
										) : (
											<p className='course-builder__sub'>
												Add sections first, then attach
												lessons with video to each
												section. Everything saves to
												your course as you go.
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
													Add course section
												</h2>
												<p className='course-builder__help'>
													Create the outline for your
													course (units, chapters, or
													modules).
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
																Section name
															</label>
															<input
																id='cb-section-name'
																type='text'
																className={
																	'course-builder__input'
																}
																placeholder='e.g. Welcome &amp; overview'
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
															? 'Saving…'
															: 'Add section'}
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
													Add lesson
												</h2>
												<p className='course-builder__help'>
													After a section exists,
													record or upload lesson
													video (WebM, MP4, MOV). Max
													about 200 MB.
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
																Lesson title
															</label>
															<input
																id='cb-lesson-title'
																type='text'
																className={
																	'course-builder__input'
																}
																placeholder='Lesson title'
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
																Course sections
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
																	Choose a
																	section
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
																Lesson video
															</label>
															<div style={{ position: 'relative' }}>
																<input
																	ref={
																		videoInputRef
																	}
																	type='file'
																	name='video'
																	accept='video/*,.webm'
																	aria-label='Upload lesson video file'
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
																	Choose file
																</button>
																<span className={
																	'course-builder__file-meta'
																}
																>
																	{videoLabel
																		|| (
																			'No file chosen'
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
																Description
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
																	(optional)
																</span>
															</label>
															<textarea
																id='cb-lesson-desc'
																className={
																	'course-builder__input ' +
																	'course-builder__textarea'
																}
																placeholder='Short notes for this lesson…'
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
															? 'Uploading…'
															: 'Add lesson'}
													</button>
												</form>
											</div>
										</section>
									</div>
								</div>
								<p className='course-builder__back'>
									<Link to={backToSubjectCoursesHref}>
										← Back to courses for this subject
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
