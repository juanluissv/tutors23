import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useAddStudentEmailToSubjectMutation,
	useGetSubjectsByTeacherIdQuery,
} from '../../slices/teachers/teacherApiSlice'
import { localizeApiError } from '../../utils/localizeApiMessage'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

function TeacherAddStudentToSubjectScreen () {
	const { id: subjectId } = useParams()
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherIdStr = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [email, setEmail] = useState('')

	const {
		data: subjects = [],
		isLoading: isLoadingList,
		isError: isListError,
		refetch: refetchSubjects,
	} = useGetSubjectsByTeacherIdQuery(teacherIdStr, {
		skip: !teacherIdStr,
	})

	const [addStudentEmail, { isLoading: isSaving }] =
		useAddStudentEmailToSubjectMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const isBusy = isLoadingList || isSaving

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
		if (email.trim() === '') {
			toast.error('Por favor ingresa el correo del estudiante')
			return
		}
		if (!isValidSubjectParam || !teacherIdStr) {
			return
		}

		try {
			await addStudentEmail({
				subjectId: String(subjectId),
				teacherId: teacherIdStr,
				email: email.trim(),
			}).unwrap()
			toast.success('Correo del estudiante agregado')
			navigate(`/teachers/students/`, { replace: true })
		} catch (err) {
			toast.error(
				localizeApiError(
					err,
					'No se pudo agregar el correo del estudiante',
				),
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/teachers/students'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>Enlace no válido</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Este enlace de materia no es válido.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isListError) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/teachers/students'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No pudimos cargar las materias.
										</p>
									</div>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetchSubjects()}
									>
										Intentar de nuevo
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoadingList && !currentSubject) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/teachers/students'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No hay una materia con este id en tus
											asignaciones, o pudo haber sido eliminada.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

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
									<div className='login-card__back'>
										<Link
											to={`/teachers/students/${subjectId}`}
											className='login-card__link'
										>
											← Volver a estudiantes
										</Link>
									</div>
									<h1 className='login-card__title'>
										Agregar estudiante por correo
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Agrega el correo de un estudiante inscrito en{' '}
										<strong>
											{currentSubject?.title || 'esta materia'}
										</strong>
										. Los correos duplicados se ignoran.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Cargando…
									</p>
								) : (
									<form
										className='login-form'
										id='teacher-add-student-form'
										name='teacher-add-student-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='teacher-add-student-email'
											>
												Correo del estudiante
											</label>
											<input
												type='email'
												id='teacher-add-student-email'
												name='email'
												className='login-input'
												placeholder='estudiante@escuela.edu'
												autoComplete='email'
												value={email}
												disabled={isBusy}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='teacher-add-student-submit'
											className='login-submit'
											disabled={isBusy}
										>
											{isSaving
												? 'Agregando…'
												: 'Agregar estudiante'}
										</button>
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherAddStudentToSubjectScreen
