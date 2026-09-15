import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useAddTeacherToSchoolMutation,
	useGetSchoolByIdQuery,
	useGetTeachersBySchoolQuery,
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

function formatNamePart (value) {
	if (!value) {
		return ''
	}
	const trimmed = String(value).trim()
	if (trimmed === '') {
		return ''
	}
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatTeacherName (firstname, lastname) {
	return [
		formatNamePart(firstname),
		formatNamePart(lastname),
	].filter(Boolean).join(' ')
}

function teacherInitials (firstname, lastname) {
	const first = formatNamePart(firstname).charAt(0)
	const last = formatNamePart(lastname).charAt(0)
	return (first + last) || '?'
}

function SchoolAdminAddTeacherScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: teachers = [],
		isLoading: isLoadingTeachers,
		isError: isTeachersError,
		refetch: refetchTeachers,
	} = useGetTeachersBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const [addTeacher, { isLoading: isSaving }] = useAddTeacherToSchoolMutation()

	const teachersList = Array.isArray(teachers) ? teachers : []
	const schoolType = schoolData?.schoolType ?? ''
	const isBusy = isSaving || isLoadingSchool

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
		if (!schoolId) {
			return
		}
		if (firstname.trim() === '') {
			toast.error('Ingresa el nombre del profesor')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Ingresa el apellido del profesor')
			return
		}
		if (email.trim() === '') {
			toast.error('Ingresa el correo del profesor')
			return
		}
		if (schoolType.trim() === '') {
			toast.error(
				'No pudimos determinar el tipo de escuela. Intenta de nuevo.',
			)
			return
		}

		try {
			await addTeacher({
				schoolId,
				firstname: firstname.trim(),
				lastname: lastname.trim(),
				email: email.trim(),
				schoolType,
			}).unwrap()
			toast.success('Profesor agregado a tu escuela')
			setFirstname('')
			setLastname('')
			setEmail('')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo agregar el profesor',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											Aún no hay escuela
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Registra tu escuela primero; después
											podrás agregar profesores.
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

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login content-area--login-scroll'>
					<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Agregar un profesor
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Ingresa el nombre y correo del profesor para
										agregarlo a tu escuela. Podrá registrarse o
										iniciar sesión más tarde con este correo.
									</p>
								</div>

								<section
									className='school-teachers-roster'
									aria-label='Profesores ya en tu escuela'
								>
									<div className='school-teachers-roster__header'>
										<h2 className='school-teachers-roster__title'>
											Profesores en tu escuela
										</h2>
										{!isLoadingTeachers && !isTeachersError && (
											<span
												className='school-teachers-roster__count'
												aria-label={`${teachersList.length} profesores`}
											>
												{teachersList.length}
											</span>
										)}
									</div>

									{isLoadingTeachers && (
										<p className='school-teachers-roster__status'>
											Cargando profesores…
										</p>
									)}

									{isTeachersError && !isLoadingTeachers && (
										<div className='school-teachers-roster__empty'>
											<p className='school-teachers-roster__status'>
												No pudimos cargar tus profesores.
											</p>
											<button
												type='button'
												className='login-submit'
												style={{ marginTop: '0.75rem' }}
												onClick={() => void refetchTeachers()}
											>
												Intentar de nuevo
											</button>
										</div>
									)}

									{!isLoadingTeachers
										&& !isTeachersError
										&& teachersList.length === 0 && (
										<p className='school-teachers-roster__empty'>
											Aún no hay profesores agregados. Usa el
											formulario de abajo para agregar tu
											primer profesor.
										</p>
									)}

									{!isLoadingTeachers
										&& !isTeachersError
										&& teachersList.length > 0 && (
										<ul className='school-teachers-roster__list'>
											{teachersList.map((teacher) => {
												const id = String(
													teacher._id ?? teacher.email,
												)
												const displayName = formatTeacherName(
													teacher.firstname,
													teacher.lastname,
												)

												return (
													<li
														key={id}
														className='school-teachers-roster__item'
													>
														<div
															className='school-teachers-roster__avatar'
															aria-hidden='true'
														>
															{teacherInitials(
																teacher.firstname,
																teacher.lastname,
															)}
														</div>
														<div className='school-teachers-roster__info'>
															<span className='school-teachers-roster__name'>
																{displayName}
															</span>
															<span className='school-teachers-roster__email'>
																{teacher.email}
															</span>
														</div>
													</li>
												)
											})}
										</ul>
									)}
								</section>

								<form
									className='login-form'
									id='schooladmin-add-teacher-form'
									name='schooladmin-add-teacher-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-firstname'
										>
											Nombre
										</label>
										<input
											type='text'
											id='schooladmin-add-teacher-firstname'
											name='firstname'
											className='login-input'
											placeholder='p. ej. María'
											autoComplete='given-name'
											value={firstname}
											required
											disabled={isBusy}
											onChange={(e) =>
												setFirstname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-lastname'
										>
											Apellido
										</label>
										<input
											type='text'
											id='schooladmin-add-teacher-lastname'
											name='lastname'
											className='login-input'
											placeholder='p. ej. García'
											autoComplete='family-name'
											value={lastname}
											required
											disabled={isBusy}
											onChange={(e) =>
												setLastname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-email'
										>
											Correo electrónico
										</label>
										<input
											type='email'
											id='schooladmin-add-teacher-email'
											name='email'
											className='login-input'
											placeholder='profesor@escuela.edu'
											autoComplete='email'
											value={email}
											required
											disabled={isBusy}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<button
										type='submit'
										id='schooladmin-add-teacher-submit'
										className='login-submit'
										disabled={isBusy}
									>
										{isSaving ? 'Agregando…' : 'Agregar profesor'}
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminAddTeacherScreen
