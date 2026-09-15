import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetPlanByIdQuery,
	useGetSubjectsBySchoolQuery,
	useUpdatePlanMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import PlanSemesterFields from '../../components/PlanSemesterFields'
import { getGradeLevelLabel, getSubjectGradeLevelNames } from '../../utils/gradeLevel'
import { getSubjectProgramsLabel } from '../../utils/universityProgram'
import {
	resizeSemesterRows,
	semestersFromPlan,
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

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

function SchoolAdminUpdatePlanScreen () {
	const { id: planId } = useParams()
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const isValidPlanParam =
		planId != null && OBJECT_ID_RE.test(String(planId))

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [price, setPrice] = useState('')
	const [totalQuestions, setTotalQuestions] = useState('')
	const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
	const [isPlanActive, setIsPlanActive] = useState(true)
	const [semesters, setSemesters] = useState([])
	const [formReady, setFormReady] = useState(false)

	const {
		data: plan,
		isLoading: planLoading,
		isError: planError,
		refetch: refetchPlan,
	} = useGetPlanByIdQuery(String(planId), {
		skip: !isValidPlanParam,
	})

	const {
		data: subjects,
		isLoading: subjectsLoading,
		isFetching: subjectsFetching,
		error: subjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, { skip: !schoolId })

	const [updatePlan, { isLoading: isSaving }] = useUpdatePlanMutation()

	const subjectsList = useMemo(
		() => (Array.isArray(subjects) ? subjects : []),
		[subjects],
	)

	const subjectsBusy = subjectsLoading || subjectsFetching
	const isBusy = planLoading || isSaving

	const isUniversityPlan = useMemo(
		() => Boolean(plan?.program),
		[plan],
	)

	const planCohortLabel = useMemo(() => {
		if (isUniversityPlan) {
			return getSubjectProgramsLabel(plan?.program, 'Sin definir')
		}
		return getGradeLevelLabel(plan?.gradesLevel, 'Sin definir')
	}, [plan, isUniversityPlan])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (!plan) {
			return
		}
		setPrice(String(plan.price ?? ''))
		setTotalQuestions(String(plan.totalQuestions ?? ''))
		setIsPlanActive(plan.active !== false)
		const isUni = Boolean(plan.program)
		const ids = isUni
			? []
			: Array.isArray(plan.subjects)
				? plan.subjects.map((s) =>
					String(typeof s === 'object' && s?._id ? s._id : s),
				)
				: []
		setSelectedSubjectIds(ids)
		setSemesters(semestersFromPlan(plan))
		setFormReady(true)
	}, [plan])

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
		if (!isValidPlanParam) {
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

		if (!isUniversityPlan && selectedSubjectIds.length === 0) {
			toast.error('Selecciona al menos una materia incluida en este plan')
			return
		}

		const semesterError = validateSemesterForm(semesters)
		if (semesterError) {
			toast.error(translateSemesterFormError(semesterError))
			return
		}

		try {
			await updatePlan({
				id: String(planId),
				price: priceNum,
				totalQuestions: totalNum,
				subjects: isUniversityPlan ? [] : selectedSubjectIds,
				active: isPlanActive,
				semesters,
			}).unwrap()
			toast.success('Plan actualizado')
			navigate('/schooladmins/plans', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo actualizar el plan',
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
											podrás editar planes de suscripción.
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

	if (!isValidPlanParam) {
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
											Plan no válido
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Este enlace de plan no es válido.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
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
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Editar plan
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										{isUniversityPlan
											? 'Consulta y actualiza este plan de suscripción. Cambia el precio, la cuota de preguntas o si el plan está activo. Los estudiantes eligen sus materias después de suscribirse.'
											: 'Consulta y actualiza este plan de suscripción. Cambia el precio, la cuota de preguntas, las materias incluidas o si el plan está activo.'}
										{' '}
										<Link to='/schooladmins/plans'>
											Volver a planes
										</Link>
									</p>
								</div>

								{planLoading && (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Cargando plan…
									</p>
								)}

								{planError && !planLoading && (
									<div className='login-field'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No pudimos cargar este plan.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchPlan()}
										>
											Intentar de nuevo
										</button>
									</div>
								)}

								{!planLoading && !planError && plan && formReady && (
									<form
										className='login-form'
										id='schooladmin-update-plan-form'
										name='schooladmin-update-plan-form'
										onSubmit={handleSubmit}
									>
										{typeof plan.studentCount === 'number' && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												{plan.studentCount}{' '}
												{plan.studentCount === 1
													? 'estudiante'
													: 'estudiantes'}{' '}
												en este plan
											</p>
										)}
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-update-plan-price'
											>
												Precio
											</label>
											<input
												type='number'
												id='schooladmin-update-plan-price'
												name='price'
												className='login-input'
												placeholder='p. ej. 29.99'
												min={0}
												step='any'
												autoComplete='off'
												value={price}
												disabled={isBusy}
												onChange={(e) =>
													setPrice(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-update-plan-questions'
											>
												Preguntas totales
											</label>
											<input
												type='number'
												id='schooladmin-update-plan-questions'
												name='totalQuestions'
												className='login-input'
												placeholder='p. ej. 50'
												min={1}
												step={1}
												autoComplete='off'
												value={totalQuestions}
												disabled={isBusy}
												onChange={(e) =>
													setTotalQuestions(e.target.value)}
											/>
										</div>
										<PlanSemesterFields
											semesters={semesters}
											disabled={isBusy}
											idPrefix='schooladmin-update-plan-semester'
											onCountChange={handleSemesterCountChange}
											onDateChange={handleSemesterDateChange}
										/>
										<div className='login-field'>
											<span
												className='login-label'
												id='schooladmin-update-plan-cohort-label'
											>
												{isUniversityPlan ? 'Programa' : 'Grado'}
											</span>
											<div
												className='plan-grade-level'
												role='group'
												aria-labelledby='schooladmin-update-plan-cohort-label'
											>
												<span
													className='plan-grade-level__badge'
													aria-label={`${
														isUniversityPlan
															? 'Programa'
															: 'Grado'
													} del plan: ${planCohortLabel}`}
												>
													<span
														className='plan-grade-level__icon'
														aria-hidden='true'
													>
														<svg
															width='16'
															height='16'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
														>
															<path d='M22 10v6M2 10l10-5 10 5-10 5z' />
															<path d='M6 12v5c0 2 2 3 6 3s6-1 6-3v-5' />
														</svg>
													</span>
													<span className='plan-grade-level__text'>
														{planCohortLabel}
													</span>
												</span>
												<p className='plan-grade-level__hint'>
													Se define al crear el plan y no
													se puede cambiar aquí.
												</p>
											</div>
										</div>
										{isUniversityPlan ? (
											<div className='login-field'>
												<p className='school-grades-levels__hint'>
													Los estudiantes suscritos a este plan
													elegirán hasta {plan.maxSubjects ?? 5}{' '}
													materias de este programa después del
													pago, y de nuevo cuando comience un
													nuevo semestre.
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
															disabled={isBusy}
															onClick={() => refetchSubjects()}
														>
															Intentar de nuevo
														</button>
													</div>
												)}
												{!subjectsBusy && subjectsList.length === 0 && (
													<p className='login-card__subtitle login-card__subtitle--wide'>
														Aún no hay materias.{' '}
														<Link to='/schooladmins/createsubject'>
															Crea una materia
														</Link>{' '}
														primero.
													</p>
												)}
												{!subjectsBusy && subjectsList.length > 0 && (
													<div
														className='login-field login-field--stack'
														style={{
															maxHeight: '220px',
															overflowY: 'auto',
															marginTop: '0.5rem',
															padding: '0.5rem 0',
															borderTop:
																'1px solid rgba(148,163,184,0.35)',
															borderBottom:
																'1px solid rgba(148,163,184,0.35)',
														}}
														role='group'
														aria-label='Materias incluidas en el plan'
													>
														{subjectsList.map((sub) => {
															const sid = String(sub._id)
															const gradeLabel = (() => {
																const names = getSubjectGradeLevelNames(
																	sub.gradesLevel,
																)
																return names !== ''
																	? ` · Grado ${names}`
																	: ''
															})()
															return (
																<label
																	key={sid}
																	className='login-remember'
																	htmlFor={`schooladmin-update-plan-subject-${sid}`}
																	style={{
																		display: 'flex',
																		alignItems: 'flex-start',
																		marginBottom: '0.65rem',
																	}}
																>
																	<input
																		type='checkbox'
																		id={`schooladmin-update-plan-subject-${sid}`}
																		className='login-checkbox'
																		checked={selectedSubjectIds.includes(
																			sid,
																		)}
																		disabled={isBusy}
																		onChange={() =>
																			handleToggleSubject(sid)}
																	/>
																	<span className='login-remember__text'>
																		{sub.title}
																		{gradeLabel}
																	</span>
																</label>
															)
														})}
													</div>
												)}
											</div>
										)}
										<div className='login-field login-field--row'>
											<label
												className='login-remember'
												htmlFor='schooladmin-update-plan-active'
											>
												<input
													type='checkbox'
													id='schooladmin-update-plan-active'
													name='active'
													className='login-checkbox'
													checked={isPlanActive}
													disabled={isBusy}
													onChange={(e) =>
														setIsPlanActive(
															e.target.checked,
														)}
												/>
												<span className='login-remember__text'>
													El plan está activo
												</span>
											</label>
										</div>
										<button
											type='submit'
											id='schooladmin-update-plan-submit'
											className='login-submit'
											disabled={
												isBusy
												|| (!isUniversityPlan
													&& (subjectsBusy
														|| subjectsList.length === 0))
											}
										>
											{isSaving ? 'Guardando…' : 'Guardar cambios'}
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

export default SchoolAdminUpdatePlanScreen
