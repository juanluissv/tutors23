import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useCreateCourseMutation,
	useGetSubjectsByTeacherIdQuery,
} from '../../slices/teachers/teacherApiSlice'
import '../../App.css'

function TeacherCreateCourseScreen () {
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id ? String(teacherInfo._id) : null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [subjectId, setSubjectId] = useState('')
	const [description, setDescription] = useState('')

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
	} = useGetSubjectsByTeacherIdQuery(teacherId, { skip: !teacherId })

	const [createCourse, { isLoading: isSubmitting }] = useCreateCourseMutation()

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (title.trim() === '') {
			toast.error('Please enter the course title')
			return
		}
		if (!subjectId) {
			toast.error('Please select a subject')
			return
		}
		if (!teacherId) {
			return
		}

		const body = {
			teacherId,
			title: title.trim(),
			subject: subjectId,
		}
		if (description.trim() !== '') {
			body.description = description.trim()
		}

		try {
			await createCourse(body).unwrap()
			toast.success('Course created')
			navigate('/teachers/subjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not create course',
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	const hasSubjects = Array.isArray(subjects) && subjects.length > 0
	const isFormDisabled = isSubmitting || isLoadingSubjects

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<TeacherHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Create a course
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Link a new course to one of your subjects and
										add an optional description. New courses stay
										unpublished until you change that later;
										you can add sections and lessons afterward.
									</p>
								</div>
								{isSubjectsError ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Could not load your subjects. Please try
										again.
									</p>
								) : null}
								{!isLoadingSubjects && !hasSubjects ? (
									<div className='login-card__header'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											You need at least one subject before
											creating a course. Subjects appear here when
											a school admin adds you by email.
										</p>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											<Link to='/teachers/subjects'>
												Back to my subjects
											</Link>
										</p>
									</div>
								) : null}
								{hasSubjects || isLoadingSubjects ? (
									<form
										className='login-form'
										id='teacher-create-course-form'
										name='teacher-create-course-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='teacher-create-course-title'
											>
												Course title
											</label>
											<input
												type='text'
												id='teacher-create-course-title'
												name='title'
												className='login-input'
												placeholder='e.g. Unit 1 — Getting started'
												autoComplete='off'
												value={title}
												disabled={isFormDisabled}
												onChange={(e) =>
													setTitle(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='teacher-create-course-subject'
											>
												Subject
											</label>
											<select
												id='teacher-create-course-subject'
												name='subject'
												className='login-input'
												value={subjectId}
												disabled={isFormDisabled}
												onChange={(e) =>
													setSubjectId(e.target.value)}
												required
											>
												<option value=''>
													{isLoadingSubjects
														? 'Loading subjects…'
														: 'Select a subject'}
												</option>
												{subjects.map((s) => (
													<option
														key={String(s._id)}
														value={String(s._id)}
													>
														{s.title}
													</option>
												))}
											</select>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='teacher-create-course-description'
											>
												Description (optional)
											</label>
											<textarea
												id='teacher-create-course-description'
												name='description'
												className='login-input login-textarea'
												placeholder='What this course covers…'
												rows={4}
												value={description}
												disabled={isFormDisabled}
												onChange={(e) =>
													setDescription(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='teacher-create-course-submit'
											className='login-submit'
											disabled={
												isFormDisabled
												|| !hasSubjects
											}
										>
											{isSubmitting
												? 'Creating…'
												: 'Create course'}
										</button>
									</form>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherCreateCourseScreen
