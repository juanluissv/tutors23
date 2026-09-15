import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useCreatePlanMutation,
	useGetSchoolByIdQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import PlanSemesterFields from '../../components/PlanSemesterFields'
import {
	normalizeGradeLevels,
	subjectIncludesGradeLevel,
} from '../../utils/gradeLevel'
import {
	normalizeUniversityPrograms,
	subjectIncludesProgram,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
import {
	createEmptySemesterRow,
	resizeSemesterRows,
	validateSemesterForm,
} from '../../utils/planSemester'
import '../../App.css'

function translateSemesterFormError (message) {
	if (message == null || message === '') {
		return message
	}
	const text = String(message)
	const semesterMatch = text.match(/^Semester (\d+)/)
	const semesterLabel = semesterMatch
		? `Semestre ${semesterMatch[1]}`
		: null

	if (text.includes('Plans can have between')) {
		return 'Los planes pueden tener entre 1 y 4 semestres'
	}
	if (semesterLabel && text.includes('start date is required')) {
		return `La fecha de inicio de ${semesterLabel} es obligatoria`
	}
	if (semesterLabel && text.includes('end date is required')) {
		return `La fecha de fin de ${semesterLabel} es obligatoria`
	}
	if (semesterLabel && text.includes('has an invalid date')) {
		return `${semesterLabel} tiene una fecha no válida`
	}
	if (semesterLabel && text.includes('end date must be after its start date')) {
		return `La fecha de fin de ${semesterLabel} debe ser posterior a su fecha de inicio`
	}
	if (semesterLabel && text.includes('must start after semester')) {
		const prevMatch = text.match(/semester (\d+) ends/)
		const prevNum = prevMatch ? prevMatch[1] : ''
		return `${semesterLabel} debe comenzar después de que termine el semestre ${prevNum}`
	}
	return text
}

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

function SchoolAdminCreatePlanScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [price, setPrice] = useState('')
	const [totalQuestions, setTotalQuestions] = useState('')
	const [selectedGradesLevel, setSelectedGradesLevel] = useState('')
	const [selectedProgram, setSelectedProgram] = useState('')
	const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
	const [isPlanActive, setIsPlanActive] = useState(true)
	const [semesters, setSemesters] = useState([
		createEmptySemesterRow(),
	])

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, { skip: !schoolId })

	const {
		data: subjects,
		isLoading: subjectsLoading,
		isFetching: subjectsFetching,
		error: subjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, { skip: !schoolId })

	const [createPlan, { isLoading: isSaving }] = useCreatePlanMutation()

	const gradesLevels = useMemo(
		() => normalizeGradeLevels(schoolData?.gradesLevels),
		[schoolData],
	)

	const programs = useMemo(
		() => normalizeUniversityPrograms(schoolData?.programs),
		[schoolData],
	)

	const isUniversity = isUniversitySchool(schoolData?.schoolType)

	const selectedCohortLabel = useMemo(() => {
		const cohortId = isUniversity ? selectedProgram : selectedGradesLevel
		if (cohortId === '') {
			return ''
		}
		const list = isUniversity ? programs : gradesLevels
		return list.find((item) => String(item._id) === cohortId)?.name ?? ''
	}, [
		isUniversity,
		selectedProgram,
		selectedGradesLevel,
		programs,
		gradesLevels,
	])

	const subjectsList = useMemo(
		() => (Array.isArray(subjects) ? subjects : []),
		[subjects],
	)

	const filteredSubjects = useMemo(() => {
		const cohortId = isUniversity ? selectedProgram : selectedGradesLevel
		if (cohortId === '') {
			return []
		}
		return subjectsList.filter(
			(sub) => isUniversity
				? subjectIncludesProgram(sub.program, cohortId)
				: subjectIncludesGradeLevel(sub.gradesLevel, cohortId),
		)
	}, [
		subjectsList,
		isUniversity,
		selectedGradesLevel,
		selectedProgram,
	])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const handleToggleSubject = (subjectId) => {
		const id = String(subjectId)
		setSelectedSubjectIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	const handleSemesterCountChange = (value) => {
		setSemesters((prev) => resizeSemesterRows(prev, value))
	}

	const handleSemesterDateChange = (index, field, value) => {
		setSemesters((prev) =>
			prev.map((row, i) =>
				i === index ? { ...row, [field]: value } : row,
			),
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!schoolId) {
			return
		}

		const priceNum = Number(price)
		if (Number.isNaN(priceNum) || priceNum < 0) {
			toast.error('Ingresa un precio válido (0 o mayor)')
			return
		}

		const totalNum = Number(totalQuestions)
		if (
			Number.isNaN(totalNum)
			|| totalNum < 1
			|| Math.floor(totalNum) !== totalNum
		) {
			toast.error(
				'Las preguntas totales deben ser un número entero de al menos 1',
			)
			return
		}

		if (!isUniversity && selectedSubjectIds.length === 0) {
			toast.error('Selecciona al menos una materia incluida en este plan')
			return
		}

		if (isUniversity) {
			if (selectedProgram === '') {
				toast.error('Selecciona un programa para este plan')
				return
			}
		} else if (selectedGradesLevel === '') {
			toast.error('Selecciona un grado para este plan')
			return
		}

		const semesterError = validateSemesterForm(semesters)
		if (semesterError) {
			toast.error(translateSemesterFormError(semesterError))
			return
		}

		try {
			const planPayload = {
				price: priceNum,
				totalQuestions: totalNum,
				subjects: isUniversity ? [] : selectedSubjectIds,
				active: isPlanActive,
				school: schoolId,
				semesters,
			}
			if (isUniversity) {
				planPayload.program = selectedProgram
			} else {
				planPayload.gradesLevel = selectedGradesLevel
			}
			await createPlan(planPayload).unwrap()
			toast.success('Plan creado')
			navigate('/schooladmins/plans', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo crear el plan',
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
											podrás crear planes de suscripción.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Registrar tu escuela
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

	const subjectsBusy = subjectsLoading || subjectsFetching
	const formBusy = isSaving || subjectsBusy || isLoadingSchool

	if (
		!isUniversity
		&& !subjectsBusy
		&& !subjectsError
		&& subjectsList.length === 0
	) {
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
											Aún no hay materias
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Agrega al menos una materia antes de
											poder crear un plan de suscripción.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/createsubject'>
											Crear una materia
										</Link>
										{' · '}
										<Link to='/schooladmins/plans'>
											Volver a planes
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
						<div
							className='center-content2 login-screen login-screen--wide login-screen--subject-form'
							style={{ marginTop: 'calc(1.5rem - 40px)' }}
						>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Crear un plan
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										{isUniversity
											? 'Define el precio, cuántas preguntas incluye, qué programa cubre este plan y las fechas del semestre. Los estudiantes elegirán sus materias después de suscribirse y de nuevo cuando comience un nuevo semestre.'
											: 'Define el precio, cuántas preguntas incluye, qué materias pertenecen a este plan y las fechas del semestre. Elige un grado para ver las materias de ese grado.'}
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-create-plan-form'
									name='schooladmin-create-plan-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-plan-price'
										>
											Precio
										</label>
										<input
											type='number'
											id='schooladmin-create-plan-price'
											name='price'
											className='login-input'
											placeholder='p. ej. 29.99'
											min={0}
											step='any'
											autoComplete='off'
											value={price}
											disabled={formBusy}
											onChange={(e) => setPrice(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-plan-questions'
										>
											Preguntas totales
										</label>
										<input
											type='number'
											id='schooladmin-create-plan-questions'
											name='totalQuestions'
											className='login-input'
											placeholder='p. ej. 50'
											min={1}
											step={1}
											autoComplete='off'
											value={totalQuestions}
											disabled={formBusy}
											onChange={(e) =>
												setTotalQuestions(e.target.value)}
										/>
									</div>
									<PlanSemesterFields
										semesters={semesters}
										disabled={formBusy}
										idPrefix='schooladmin-create-plan-semester'
										onCountChange={handleSemesterCountChange}
										onDateChange={handleSemesterDateChange}
									/>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-plan-cohort'
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
												id='schooladmin-create-plan-cohort'
												name={isUniversity ? 'program' : 'gradesLevel'}
												className='login-input'
												value={isUniversity
													? selectedProgram
													: selectedGradesLevel}
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
									{isUniversity ? (
										<div className='login-field'>
											<p className='school-grades-levels__hint'>
												Los estudiantes suscritos a este plan
												elegirán hasta 5 materias de este
												programa después del pago, y de nuevo
												cuando comience un nuevo semestre.
											</p>
										</div>
									) : (
									<div className='login-field'>
										<span className='login-label'>
											Materias en este plan
										</span>
										{subjectsBusy && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												Cargando materias…
											</p>
										)}
										{subjectsError && !subjectsBusy && (
											<div className='login-field'>
												<p className='login-card__subtitle login-card__subtitle--wide'>
													No se pudieron cargar las materias.
												</p>
												<button
													type='button'
													className='login-submit'
													style={{ marginTop: '0.5rem' }}
													disabled={formBusy}
													onClick={() => refetchSubjects()}
												>
													Intentar de nuevo
												</button>
											</div>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& subjectsList.length === 0 && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												Aún no hay materias.{' '}
												<Link to='/schooladmins/createsubject'>
													Crea una materia
												</Link>{' '}
												primero.
											</p>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& subjectsList.length > 0
											&& selectedCohortLabel === '' && (
											<p className='school-grades-levels__hint'>
												Selecciona {isUniversity
													? 'un programa'
													: 'un grado'} arriba para elegir
												las materias de este plan.
											</p>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& selectedCohortLabel !== ''
											&& filteredSubjects.length === 0 && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												No hay materias para{' '}
												<strong>{selectedCohortLabel}</strong>
												.{' '}
												<Link to='/schooladmins/createsubject'>
													Crea una materia
												</Link>{' '}
												con este {isUniversity
													? 'programa'
													: 'grado'}.
											</p>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& filteredSubjects.length > 0 && (
											<div
												className='login-field login-field--stack'
												style={{
													maxHeight: '220px',
													overflowY: 'auto',
													marginTop: '0.5rem',
													padding: '0.5rem 0',
													borderTop: '1px solid rgba(148,163,184,0.35)',
													borderBottom:
														'1px solid rgba(148,163,184,0.35)',
												}}
												role='group'
												aria-label={`Materias de ${
													selectedCohortLabel || 'grupo'
												}`}
											>
												{filteredSubjects.map((sub) => {
													const id = String(sub._id)
													return (
														<label
															key={id}
															className='login-remember'
															htmlFor={`schooladmin-plan-subject-${id}`}
															style={{
																display: 'flex',
																alignItems: 'flex-start',
																marginBottom: '0.65rem',
															}}
														>
															<input
																type='checkbox'
																id={`schooladmin-plan-subject-${id}`}
																className='login-checkbox'
																checked={selectedSubjectIds.includes(
																	id,
																)}
																disabled={formBusy}
																onChange={() =>
																	handleToggleSubject(id)}
															/>
															<span className='login-remember__text'>
																{sub.title}
															</span>
														</label>
													)
												})}
											</div>
										)}
										{selectedSubjectIds.length > 0 && (
											<p className='school-grades-levels__hint'>
												{selectedSubjectIds.length}{' '}
												{selectedSubjectIds.length === 1
													? 'materia seleccionada'
													: 'materias seleccionadas'}{' '}
												(en todos los grados).
											</p>
										)}
									</div>
									)}
									<div className='login-field login-field--row'>
										<label
											className='login-remember'
											htmlFor='schooladmin-create-plan-active'
										>
											<input
												type='checkbox'
												id='schooladmin-create-plan-active'
												name='active'
												className='login-checkbox'
												checked={isPlanActive}
												disabled={formBusy}
												onChange={(e) =>
													setIsPlanActive(e.target.checked)}
											/>
											<span className='login-remember__text'>
												El plan está activo
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='schooladmin-create-plan-submit'
										className='login-submit'
										disabled={
											formBusy
											|| (isUniversity
												? programs.length === 0
												: gradesLevels.length === 0
													|| subjectsList.length === 0)
										}
									>
										{isSaving ? 'Creando…' : 'Crear plan'}
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

export default SchoolAdminCreatePlanScreen
