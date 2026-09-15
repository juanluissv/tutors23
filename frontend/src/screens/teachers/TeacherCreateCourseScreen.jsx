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
import { localizeApiError } from '../../utils/localizeApiMessage'
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
			toast.error('Ingresa el título del curso')
			return
		}
		if (!subjectId) {
			toast.error('Selecciona una materia')
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
			toast.success('Curso creado')
			navigate('/teachers/subjects', { replace: true })
		} catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo crear el curso'),
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
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Crear un curso
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Vincula un curso nuevo a una de tus materias
										y agrega una descripción opcional. Los cursos
										nuevos permanecen sin publicar hasta que lo
										cambies más adelante; puedes agregar
										secciones y lecciones después.
									</p>
								</div>
								{isSubjectsError ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										No pudimos cargar tus materias. Intenta de
										nuevo.
									</p>
								) : null}
								{!isLoadingSubjects && !hasSubjects ? (
									<div className='login-card__header'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Necesitas al menos una materia antes de
											crear un curso. Las materias aparecen aquí
											cuando un administrador escolar te agrega
											por correo.
										</p>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											<Link to='/teachers/subjects'>
												Volver a mis materias
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
												Título del curso
											</label>
											<input
												type='text'
												id='teacher-create-course-title'
												name='title'
												className='login-input'
												placeholder='p. ej. Unidad 1 — Primeros pasos'
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
												Materia
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
														? 'Cargando materias…'
														: 'Selecciona una materia'}
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
												Descripción (opcional)
											</label>
											<textarea
												id='teacher-create-course-description'
												name='description'
												className='login-input login-textarea'
												placeholder='De qué trata este curso…'
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
												? 'Creando…'
												: 'Crear curso'}
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
