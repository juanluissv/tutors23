import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSubjectsBySchoolQuery,
	useSetSubjectTeacherEmailMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function resolveSchoolId (school) {
	if (!school) {
		return null
	}
	if (typeof school === 'string') {
		return school
	}
	if (typeof school === 'object' && school._id) {
		return String(school._id)
	}
	return null
}

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

function normalizeTeacherEmails (teacherEmail) {
	if (teacherEmail == null || teacherEmail === '') {
		return []
	}
	if (Array.isArray(teacherEmail)) {
		return teacherEmail
			.map((e) => String(e).trim())
			.filter((e) => e !== '')
	}
	const single = String(teacherEmail).trim()
	return single !== '' ? [single] : []
}

function SchoolAdminTeacherInviteScreen () {
	const { id: subjectId } = useParams()
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
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
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const [setSubjectTeacherEmail, { isLoading: isSaving }] =
		useSetSubjectTeacherEmailMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const savedTeacherEmails = useMemo(
		() => normalizeTeacherEmails(currentSubject?.teacherEmail),
		[currentSubject],
	)

	const isBusy = isLoadingList || isSaving

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		const trimmed = email.trim().toLowerCase()
		if (trimmed === '') {
			toast.error('Ingresa el correo del profesor')
			return
		}
		if (!isValidSubjectParam) {
			return
		}
		if (
			savedTeacherEmails.some(
				(saved) => saved.toLowerCase() === trimmed,
			)
		) {
			toast.error('Ese correo ya está guardado para esta materia')
			return
		}

		try {
			await setSubjectTeacherEmail({
				id: String(subjectId),
				email: trimmed,
			}).unwrap()
			toast.success('Correo del profesor guardado')
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo guardar el correo del profesor',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<AdminHeader
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
											Aún no hay escuela
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Registra tu escuela primero; después
											podrás invitar profesores a las materias.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Registra tu escuela
										</Link>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<AdminHeader
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
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>
											Enlace no válido
										</h1>
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
					<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<AdminHeader
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
												to='/schooladmins/mysubjects'
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
					<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<AdminHeader
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
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No hay una materia con este identificador
											en tu escuela, o pudo haber sido
											eliminada.
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
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
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
											to='/schooladmins/mysubjects'
											className='login-card__link'
										>
											← Volver a las materias
										</Link>
									</div>
									<h1 className='login-card__title'>
										Agregar un profesor a esta materia
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Agrega correos de profesores para
										<strong>
											{' '}
											{currentSubject?.title || 'esta materia'}
										</strong>
										. Las invitaciones guardadas aparecen
										abajo; puedes añadir más en cualquier
										momento.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Cargando…
									</p>
								) : (
									<form
										className='login-form'
										id='schooladmin-teacher-invite-form'
										name='schooladmin-teacher-invite-form'
										onSubmit={handleSubmit}
									>
										<div className='subject-teacher-emails'>
											<p className='subject-teacher-emails__label'>
												Correos de profesores guardados
											</p>
											{savedTeacherEmails.length > 0 ? (
												<ul
													className='subject-teacher-emails__list'
													aria-label='Correos de profesores guardados para esta materia'
												>
													{savedTeacherEmails.map(
														(savedEmail) => (
															<li
																key={savedEmail}
																className='subject-teacher-emails__item'
															>
																{savedEmail}
															</li>
														),
													)}
												</ul>
											) : (
												<p className='subject-teacher-emails__empty'>
													Aún no hay correos de profesores
													guardados para esta materia.
												</p>
											)}
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-teacher-invite-email'
											>
												Agregar correo del profesor
											</label>
											<input
												type='email'
												id='schooladmin-teacher-invite-email'
												name='email'
												className='login-input'
												placeholder='profesor@escuela.edu'
												autoComplete='email'
												value={email}
												disabled={isBusy}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='schooladmin-teacher-invite-save'
											className='login-submit'
											disabled={isBusy}
										>
											{isSaving
												? 'Guardando…'
												: 'Agregar correo'}
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

export default SchoolAdminTeacherInviteScreen
