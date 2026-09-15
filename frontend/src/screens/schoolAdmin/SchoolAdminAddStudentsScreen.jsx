import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useAddStudentToSchoolMutation,
	useGetPlansBySchoolQuery,
	useGetSchoolByIdQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { normalizeGradeLevels } from '../../utils/gradeLevel'
import {
	normalizeUniversityPrograms,
	planMatchesProgram,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
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

function formatCurrency (value) {
	const n = Number(value)
	if (Number.isNaN(n)) {
		return String(value)
	}
	try {
		return new Intl.NumberFormat('es', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(n)
	} catch {
		return `$${n}`
	}
}

function planMatchesGradeLevel (plan, gradeLevelId) {
	if (!gradeLevelId || !plan) {
		return false
	}
	const gl = plan.gradesLevel
	if (!gl) {
		return true
	}
	const planGradeId =
		typeof gl === 'object' && gl._id != null
			? String(gl._id)
			: String(gl)
	return planGradeId === String(gradeLevelId)
}

function SchoolAdminAddStudentsScreen () {
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
	const [selectedGradesLevel, setSelectedGradesLevel] = useState('')
	const [selectedProgram, setSelectedProgram] = useState('')
	const [selectedPlanId, setSelectedPlanId] = useState('')

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, { skip: !schoolId })

	const {
		data: plans = [],
		isLoading: isLoadingPlans,
		isError: isPlansError,
	} = useGetPlansBySchoolQuery(schoolId, { skip: !schoolId })

	const [addStudent, { isLoading: isSaving }] =
		useAddStudentToSchoolMutation()

	const gradesLevels = useMemo(
		() => normalizeGradeLevels(schoolData?.gradesLevels),
		[schoolData],
	)

	const programs = useMemo(
		() => normalizeUniversityPrograms(schoolData?.programs),
		[schoolData],
	)

	const isUniversity = isUniversitySchool(schoolData?.schoolType)

	const plansList = useMemo(
		() => (Array.isArray(plans) ? plans : []),
		[plans],
	)

	const activePlans = useMemo(
		() => plansList.filter((p) => p.active !== false),
		[plansList],
	)

	const filteredPlans = useMemo(() => {
		const cohortId = isUniversity ? selectedProgram : selectedGradesLevel
		if (cohortId === '') {
			return []
		}
		return activePlans.filter((plan) =>
			isUniversity
				? planMatchesProgram(plan, cohortId)
				: planMatchesGradeLevel(plan, cohortId),
		)
	}, [
		activePlans,
		isUniversity,
		selectedGradesLevel,
		selectedProgram,
	])

	const formBusy = isSaving || isLoadingSchool || isLoadingPlans

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		setSelectedPlanId('')
	}, [selectedGradesLevel, selectedProgram])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!schoolId) {
			return
		}
		if (firstname.trim() === '') {
			toast.error('Ingresa el nombre del estudiante')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Ingresa el apellido del estudiante')
			return
		}
		if (isUniversity) {
			if (selectedProgram === '') {
				toast.error('Selecciona un programa')
				return
			}
		} else if (selectedGradesLevel === '') {
			toast.error('Selecciona un grado')
			return
		}
		if (selectedPlanId === '') {
			toast.error('Selecciona un plan de suscripción')
			return
		}

		const trimmedEmail = email.trim()
		const payload = {
			schoolId,
			firstname: firstname.trim(),
			lastname: lastname.trim(),
			plan: selectedPlanId,
		}
		if (isUniversity) {
			payload.program = selectedProgram
		} else {
			payload.gradesLevel = selectedGradesLevel
		}
		if (trimmedEmail !== '') {
			payload.email = trimmedEmail
		}

		try {
			await addStudent(payload).unwrap()
			toast.success('Estudiante agregado a tu escuela')
			setFirstname('')
			setLastname('')
			setEmail('')
			setSelectedPlanId('')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo agregar el estudiante',
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
											podrás agregar estudiantes.
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
										Agregar un estudiante
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										{isUniversity
											? (
												'Ingresa los datos del estudiante, '
												+ 'asigna un programa y un plan de '
												+ 'suscripción. El correo es opcional; '
												+ 'cada estudiante recibe un nombre de '
												+ 'usuario único para iniciar sesión '
												+ 'más tarde.'
											)
											: (
												'Ingresa los datos del estudiante, '
												+ 'asigna un grado y un plan de '
												+ 'suscripción. El correo es opcional; '
												+ 'cada estudiante recibe un nombre de '
												+ 'usuario único para iniciar sesión '
												+ 'más tarde.'
											)}
									</p>
								</div>

								<form
									className='login-form'
									id='schooladmin-add-student-form'
									name='schooladmin-add-student-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-firstname'
										>
											Nombre
										</label>
										<input
											type='text'
											id='schooladmin-add-student-firstname'
											name='firstname'
											className='login-input'
											placeholder='p. ej. Alex'
											autoComplete='given-name'
											value={firstname}
											required
											disabled={formBusy}
											onChange={(e) =>
												setFirstname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-lastname'
										>
											Apellido
										</label>
										<input
											type='text'
											id='schooladmin-add-student-lastname'
											name='lastname'
											className='login-input'
											placeholder='p. ej. Rivera'
											autoComplete='family-name'
											value={lastname}
											required
											disabled={formBusy}
											onChange={(e) =>
												setLastname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-email'
										>
											Correo electrónico (opcional)
										</label>
										<input
											type='email'
											id='schooladmin-add-student-email'
											name='email'
											className='login-input'
											placeholder='estudiante@escuela.edu (opcional)'
											autoComplete='email'
											value={email}
											disabled={formBusy}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-cohort'
										>
											{isUniversity ? 'Programa' : 'Grado'}
										</label>
										{isLoadingSchool ? (
											<p className='school-grades-levels__hint'>
												{isUniversity
													? 'Cargando programas…'
													: 'Cargando grados…'}
											</p>
										) : isUniversity && programs.length === 0 ? (
											<p className='school-grades-levels__hint'>
												Aún no hay programas en tu institución.{' '}
												<Link to='/schooladmins/myschools'>
													Agrégalos en Mi escuela
												</Link>{' '}
												primero.
											</p>
										) : !isUniversity && gradesLevels.length === 0 ? (
											<p className='school-grades-levels__hint'>
												Aún no hay grados en tu escuela.{' '}
												<Link to='/schooladmins/myschools'>
													Agrégalos en Mi escuela
												</Link>{' '}
												primero.
											</p>
										) : (
											<select
												id='schooladmin-add-student-cohort'
												name={isUniversity ? 'program' : 'gradesLevel'}
												className='login-input'
												value={isUniversity
													? selectedProgram
													: selectedGradesLevel}
												required
												disabled={formBusy}
												onChange={(e) => {
													if (isUniversity) {
														setSelectedProgram(e.target.value)
													} else {
														setSelectedGradesLevel(e.target.value)
													}
												}}
											>
												<option value=''>
													{isUniversity
														? 'Selecciona un programa'
														: 'Selecciona un grado'}
												</option>
												{(isUniversity ? programs : gradesLevels)
													.map((item) => (
														<option
															key={item._id}
															value={item._id}
														>
															{item.name}
															{item.department
																? ` (${item.department})`
																: ''}
														</option>
													))}
											</select>
										)}
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-plan'
										>
											Plan de suscripción
										</label>
										{isLoadingPlans && (
											<p className='school-grades-levels__hint'>
												Cargando planes…
											</p>
										)}
										{isPlansError && !isLoadingPlans && (
											<p className='school-grades-levels__hint'>
												No se pudieron cargar los planes.
												Intenta de nuevo más tarde.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& activePlans.length === 0 && (
											<p className='school-grades-levels__hint'>
												Aún no hay planes activos.{' '}
												<Link to='/schooladmins/createplan'>
													Crea un plan
												</Link>{' '}
												primero.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& activePlans.length > 0
											&& (isUniversity
												? selectedProgram
												: selectedGradesLevel) === '' && (
											<p className='school-grades-levels__hint'>
												Selecciona {isUniversity
													? 'un programa'
													: 'un grado'} arriba para ver
												los planes correspondientes.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& (isUniversity
												? selectedProgram
												: selectedGradesLevel) !== ''
											&& filteredPlans.length === 0 && (
											<p className='school-grades-levels__hint'>
												Aún no hay planes activos para este
												{isUniversity
													? ' programa'
													: ' grado'}.{' '}
												<Link to='/schooladmins/createplan'>
													Crea un plan
												</Link>{' '}
												para este {isUniversity
													? 'programa'
													: 'grado'}.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& filteredPlans.length > 0 && (
											<select
												id='schooladmin-add-student-plan'
												name='plan'
												className='login-input'
												value={selectedPlanId}
												required
												disabled={formBusy}
												onChange={(e) =>
													setSelectedPlanId(e.target.value)}
											>
												<option value=''>
													Selecciona un plan
												</option>
												{filteredPlans.map((plan) => {
													const id = String(plan._id)
													const subjectCount =
														Array.isArray(plan.subjects)
															? plan.subjects.length
															: 0
													return (
														<option key={id} value={id}>
															{formatCurrency(plan.price)}
															{' · '}
															{plan.totalQuestions}{' '}
															preguntas ·{' '}
															{subjectCount}{' '}
															{subjectCount === 1
																? 'materia'
																: 'materias'}
														</option>
													)
												})}
											</select>
										)}
									</div>
									<button
										type='submit'
										id='schooladmin-add-student-submit'
										className='login-submit'
										disabled={
											formBusy
											|| (isUniversity
												? programs.length === 0
												: gradesLevels.length === 0)
											|| activePlans.length === 0
										}
									>
										{isSaving ? 'Agregando…' : 'Agregar estudiante'}
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

export default SchoolAdminAddStudentsScreen
