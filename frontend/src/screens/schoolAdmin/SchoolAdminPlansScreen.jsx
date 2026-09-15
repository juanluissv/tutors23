import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
	useGetPlansBySchoolQuery,
	useGetSchoolByIdQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { getSubjectProgramsLabel } from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
import '../../App.css'

const ClipboardIcon = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
			stroke="#1e293b"
			strokeWidth="1.3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"
			stroke="#1e293b"
			strokeWidth="1.3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 12h6M9 16h6"
			stroke="#1e293b"
			strokeWidth="1.3"
			strokeLinecap="round"
		/>
	</svg>
)

const StudentsIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
)

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

function summarizeSubjects (subjects, maxLabels = 3) {
	const list = Array.isArray(subjects) ? subjects : []
	const titles = list
		.map((s) =>
			s && typeof s === 'object' && s.title ? String(s.title) : null,
		)
		.filter(Boolean)
	if (titles.length === 0) {
		return 'Sin materias'
	}
	const shown = titles.slice(0, maxLabels)
	const extra = titles.length - shown.length
	const suffix = extra > 0 ? ` +${extra} más` : ''
	return `${shown.join(' · ')}${suffix}`
}

function summarizePlanCoverage (plan) {
	if (plan?.program) {
		const max = Number(plan.maxSubjects) || 5
		return `Los estudiantes eligen hasta ${max} materias`
	}
	return summarizeSubjects(plan?.subjects)
}

function formatSemesterRangeEs (semesters) {
	const list = Array.isArray(semesters) ? semesters : []
	if (list.length === 0) {
		return ''
	}
	return list.length === 1
		? '1 semestre'
		: `${list.length} semestres`
}

function planMetaLine (plan) {
	const questions = plan.totalQuestions ?? '—'
	const semesterLabel = formatSemesterRangeEs(plan.semesters)
	const active = plan.active === true ? 'Activo' : 'Inactivo'
	const isUniversityPlan = Boolean(plan.program)

	if (isUniversityPlan) {
		const programName = getSubjectProgramsLabel(
			plan.program,
			'Programa',
		)
		const max = Number(plan.maxSubjects) || 5
		const parts = [
			`${questions} preguntas incluidas`,
			programName,
			`Los estudiantes eligen hasta ${max} materias`,
		]
		if (semesterLabel) {
			parts.push(semesterLabel)
		}
		parts.push(active)
		return parts.join(' · ')
	}

	const subjectCount = Array.isArray(plan.subjects)
		? plan.subjects.length
		: 0
	const subjectLabel = `${subjectCount} ${
		subjectCount === 1 ? 'materia' : 'materias'
	}`
	const parts = [
		`${questions} preguntas incluidas`,
		subjectLabel,
	]
	if (semesterLabel) {
		parts.push(semesterLabel)
	}
	parts.push(active)
	return parts.join(' · ')
}

function SchoolAdminPlansScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const {
		data: plans = [],
		isLoading,
		isError,
		refetch,
	} = useGetPlansBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: subjects = [],
		isLoading: isSubjectsLoading,
		isError: isSubjectsError,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const hasSubjects = subjects.length > 0
	const isUniversity = isUniversitySchool(schoolData?.schoolType)
	const isPageLoading = isLoading || isSubjectsLoading || isLoadingSchool

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

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
											podrás ver y administrar los planes
											de suscripción.
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

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<div className='teacher-subjects-page'>
							<h1 className='teacher-subjects-page__title heading-gradient'>
								Planes de suscripción
							</h1>
							<p className='teacher-subjects-page__subtitle'>
								{isUniversity
									? (
										'Todos los planes de suscripción de tu '
										+ 'institución. Cada plan define el '
										+ 'precio, el numero de preguntas incluidas, el '
										+ 'programa y las fechas del semestre. '
										+ 'Los estudiantes eligen sus materias '
										+ 'después de suscribirse.'
									)
									: (
										'Todos los planes de suscripción de tu '
										+ 'institución. Cada plan define el precio, '
										+ 'el numero de preguntas incluidas y '
										+ 'las materias vinculadas.'
									)}
							</p>
							{!isPageLoading
								&& !isError
								&& !isSubjectsError
								&& plans.length > 0
								&& hasSubjects && (
								<div className='teacher-subjects-page__cta'>
									<Link
										to='/schooladmins/createplan'
										className='teacher-subjects-page__add-btn'
									>
										<span
											className='teacher-subjects-page__add-btn-icon'
											aria-hidden
										>
											+
										</span>
										<span>Crear plan</span>
									</Link>
								</div>
							)}

							{isPageLoading && (
								<p className='teacher-subjects-page__subtitle'>
									Cargando planes…
								</p>
							)}

							{isError && !isPageLoading && (
								<div className='teacher-subjects-page__subtitle'>
									<p>No pudimos cargar los planes.</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Intentar de nuevo
									</button>
								</div>
							)}

							{!isPageLoading
								&& !isError
								&& !isSubjectsError
								&& plans.length === 0
								&& !hasSubjects && (
								<div className='teacher-subjects-page__empty'>
									<p className='teacher-subjects-page__empty-text'>
										Agrega al menos una materia antes de
										poder crear un plan de suscripción.
									</p>
									<Link
										to='/schooladmins/createsubject'
										className='teacher-subjects-page__add-btn'
									>
										<span
											className='teacher-subjects-page__add-btn-icon'
											aria-hidden
										>
											+
										</span>
										<span>Crea tu primera materia</span>
									</Link>
								</div>
							)}

							{!isPageLoading
								&& !isError
								&& !isSubjectsError
								&& plans.length === 0
								&& hasSubjects && (
								<div className='teacher-subjects-page__empty'>
									<p className='teacher-subjects-page__empty-text'>
										Aún no hay planes. Empieza creando tu
										primer plan de suscripción.
									</p>
									<Link
										to='/schooladmins/createplan'
										className='teacher-subjects-page__add-btn'
									>
										<span
											className='teacher-subjects-page__add-btn-icon'
											aria-hidden
										>
											+
										</span>
										<span>Crea tu primer plan</span>
									</Link>
								</div>
							)}

							{!isPageLoading && !isError && plans.length > 0 && (
								<div className='teacher-subjects-grid'>
									{plans.map((plan, index) => {
										const id = String(
											plan._id ?? plan.id ?? index,
										)
										const variant = (index % 5) + 1
										const studentCount =
											typeof plan.studentCount === 'number'
												? plan.studentCount
												: 0

										return (
											<article
												key={id}
												className={
													`teacher-subject-card ` +
													`teacher-subject-card--grad-${variant}`
												}
											>
												<div
													className='teacher-subject-card__orb'
													aria-hidden
												/>
												<div
													className={
														'teacher-subject-card__orb ' +
														'teacher-subject-card__orb--sm'
													}
													aria-hidden
												/>

												<div className='teacher-subject-card__top'>
													<div>
														<h2 className='teacher-subject-card__name'>
															{formatCurrency(plan.price)}
														</h2>
														<span className='teacher-subject-card__students'>
															<StudentsIcon />
															{studentCount}{' '}
															{studentCount === 1
																? 'estudiante'
																: 'estudiantes'}
														</span>
														<p className='teacher-subject-card__meta'>
															{planMetaLine(plan)}
														</p>
													</div>
													<div className='teacher-subject-card__badge'>
														<ClipboardIcon />
													</div>
												</div>

												<p className='teacher-subject-card__excerpt'>
													{summarizePlanCoverage(plan)}
												</p>

												<div className='teacher-subject-card__divider' />

												<div className='teacher-subject-card__actions'>
													<div className='teacher-subject-card__row'>
														<Link
															to={`/schooladmins/subscriptions/${id}`}
															className='teacher-subject-card__btn'
														>
															Suscriptores
														</Link>
														<Link
															to={`/schooladmins/updateplan/${id}`}
															className='teacher-subject-card__btn'
														>
															Editar plan
														</Link>
													</div>
												</div>
											</article>
										)
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminPlansScreen
