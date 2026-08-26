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
			toast.error('Please enter a valid price (0 or greater)')
			return
		}

		const totalNum = Number(totalQuestions)
		if (
			Number.isNaN(totalNum)
			|| totalNum < 1
			|| Math.floor(totalNum) !== totalNum
		) {
			toast.error(
				'Total questions must be a whole number of at least 1',
			)
			return
		}

		if (!isUniversity && selectedSubjectIds.length === 0) {
			toast.error('Select at least one subject included in this plan')
			return
		}

		if (isUniversity) {
			if (selectedProgram === '') {
				toast.error('Select a program for this plan')
				return
			}
		} else if (selectedGradesLevel === '') {
			toast.error('Select a grade level for this plan')
			return
		}

		const semesterError = validateSemesterForm(semesters)
		if (semesterError) {
			toast.error(semesterError)
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
			toast.success('Plan created')
			navigate('/schooladmins/plans', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not create plan',
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
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											create subscription plans.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Register your school
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
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											No subjects yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Add at least one subject before you can
											create a subscription plan.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/createsubject'>
											Create a subject
										</Link>
										{' · '}
										<Link to='/schooladmins/plans'>
											Back to plans
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Create a plan
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										{isUniversity
											? 'Set the price, how many questions it includes, which program this plan covers, and the semester dates. Students will choose their subjects after subscribing and again when a new semester starts.'
											: 'Set the price, how many questions it includes, which subjects belong to this plan, and the semester dates. Pick a grade level to see subjects for that grade.'}
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
											Price
										</label>
										<input
											type='number'
											id='schooladmin-create-plan-price'
											name='price'
											className='login-input'
											placeholder='e.g. 29.99'
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
											Total questions
										</label>
										<input
											type='number'
											id='schooladmin-create-plan-questions'
											name='totalQuestions'
											className='login-input'
											placeholder='e.g. 50'
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
											{isUniversity ? 'Program' : 'Grade level'}
										</label>
										{isLoadingSchool ? (
											<p className='school-grades-levels__hint'>
												{isUniversity
													? 'Loading programs…'
													: 'Loading grade levels…'}
											</p>
										) : isUniversity && programs.length === 0 ? (
											<p className='school-grades-levels__hint'>
												No programs on your institution yet.{' '}
												<Link to='/schooladmins/myschools'>
													Add them in My school
												</Link>{' '}
												first.
											</p>
										) : !isUniversity && gradesLevels.length === 0 ? (
											<p className='school-grades-levels__hint'>
												No grade levels on your school yet.{' '}
												<Link to='/schooladmins/myschools'>
													Add them in My school
												</Link>{' '}
												first.
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
														? 'Select a program'
														: 'Select a grade level'}
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
												Students subscribed to this plan will
												choose up to 5 subjects from this
												program after payment, and again
												when a new semester starts.
											</p>
										</div>
									) : (
									<div className='login-field'>
										<span className='login-label'>
											Subjects in this plan
										</span>
										{subjectsBusy && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												Loading subjects…
											</p>
										)}
										{subjectsError && !subjectsBusy && (
											<div className='login-field'>
												<p className='login-card__subtitle login-card__subtitle--wide'>
													Could not load subjects.
												</p>
												<button
													type='button'
													className='login-submit'
													style={{ marginTop: '0.5rem' }}
													disabled={formBusy}
													onClick={() => refetchSubjects()}
												>
													Retry loading subjects
												</button>
											</div>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& subjectsList.length === 0 && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												No subjects yet.{' '}
												<Link to='/schooladmins/createsubject'>
													Create a subject
												</Link>{' '}
												first.
											</p>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& subjectsList.length > 0
											&& selectedCohortLabel === '' && (
											<p className='school-grades-levels__hint'>
												Select {isUniversity
													? 'a program'
													: 'a grade level'} above to choose
												subjects for this plan.
											</p>
										)}
										{!subjectsBusy
											&& !subjectsError
											&& selectedCohortLabel !== ''
											&& filteredSubjects.length === 0 && (
											<p className='login-card__subtitle login-card__subtitle--wide'>
												No subjects for{' '}
												<strong>{selectedCohortLabel}</strong>
												.{' '}
												<Link to='/schooladmins/createsubject'>
													Create a subject
												</Link>{' '}
												with this {isUniversity
													? 'program'
													: 'grade level'}.
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
												aria-label={`Subjects for ${selectedCohortLabel || 'cohort'}`}
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
												{selectedSubjectIds.length} subject
												{selectedSubjectIds.length === 1
													? ''
													: 's'} selected (across all grades).
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
												Plan is active
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
										{isSaving ? 'Creating…' : 'Create plan'}
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
