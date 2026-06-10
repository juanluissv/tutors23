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
		return new Intl.NumberFormat(undefined, {
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

	const plansList = useMemo(
		() => (Array.isArray(plans) ? plans : []),
		[plans],
	)

	const activePlans = useMemo(
		() => plansList.filter((p) => p.active !== false),
		[plansList],
	)

	const filteredPlans = useMemo(() => {
		if (selectedGradesLevel === '') {
			return []
		}
		return activePlans.filter((plan) =>
			planMatchesGradeLevel(plan, selectedGradesLevel),
		)
	}, [activePlans, selectedGradesLevel])

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
	}, [selectedGradesLevel])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!schoolId) {
			return
		}
		if (firstname.trim() === '') {
			toast.error('Please enter the student first name')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Please enter the student last name')
			return
		}
		if (selectedGradesLevel === '') {
			toast.error('Please select a grade level')
			return
		}
		if (selectedPlanId === '') {
			toast.error('Please select a subscription plan')
			return
		}

		const trimmedEmail = email.trim()
		const payload = {
			schoolId,
			firstname: firstname.trim(),
			lastname: lastname.trim(),
			gradesLevel: selectedGradesLevel,
			plan: selectedPlanId,
		}
		if (trimmedEmail !== '') {
			payload.email = trimmedEmail
		}

		try {
			await addStudent(payload).unwrap()
			toast.success('Student added to your school')
			setFirstname('')
			setLastname('')
			setEmail('')
			setSelectedPlanId('')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not add student',
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
											add students.
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
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Add a student
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Enter the student&apos;s details, assign a
										grade level and subscription plan. Email is
										optional; each student gets a unique username
										they can use to sign in later.
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
											First name
										</label>
										<input
											type='text'
											id='schooladmin-add-student-firstname'
											name='firstname'
											className='login-input'
											placeholder='e.g. Alex'
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
											Last name
										</label>
										<input
											type='text'
											id='schooladmin-add-student-lastname'
											name='lastname'
											className='login-input'
											placeholder='e.g. Rivera'
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
											Email (optional)
										</label>
										<input
											type='email'
											id='schooladmin-add-student-email'
											name='email'
											className='login-input'
											placeholder='student@school.edu (optional)'
											autoComplete='email'
											value={email}
											disabled={formBusy}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-student-grade'
										>
											Grade level
										</label>
										{isLoadingSchool ? (
											<p className='school-grades-levels__hint'>
												Loading grade levels…
											</p>
										) : gradesLevels.length === 0 ? (
											<p className='school-grades-levels__hint'>
												No grade levels on your school yet.{' '}
												<Link to='/schooladmins/myschools'>
													Add them in My school
												</Link>{' '}
												first.
											</p>
										) : (
											<select
												id='schooladmin-add-student-grade'
												name='gradesLevel'
												className='login-input'
												value={selectedGradesLevel}
												required
												disabled={formBusy}
												onChange={(e) =>
													setSelectedGradesLevel(
														e.target.value,
													)}
											>
												<option value=''>
													Select a grade level
												</option>
												{gradesLevels.map((level) => (
													<option
														key={level._id}
														value={level._id}
													>
														{level.name}
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
											Subscription plan
										</label>
										{isLoadingPlans && (
											<p className='school-grades-levels__hint'>
												Loading plans…
											</p>
										)}
										{isPlansError && !isLoadingPlans && (
											<p className='school-grades-levels__hint'>
												Could not load plans. Try again later.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& activePlans.length === 0 && (
											<p className='school-grades-levels__hint'>
												No active plans yet.{' '}
												<Link to='/schooladmins/createplan'>
													Create a plan
												</Link>{' '}
												first.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& activePlans.length > 0
											&& selectedGradesLevel === '' && (
											<p className='school-grades-levels__hint'>
												Select a grade level above to see
												matching plans.
											</p>
										)}
										{!isLoadingPlans
											&& !isPlansError
											&& selectedGradesLevel !== ''
											&& filteredPlans.length === 0 && (
											<p className='school-grades-levels__hint'>
												No active plans for this grade.{' '}
												<Link to='/schooladmins/createplan'>
													Create a plan
												</Link>{' '}
												for this grade level.
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
													Select a plan
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
															questions ·{' '}
															{subjectCount}{' '}
															{subjectCount === 1
																? 'subject'
																: 'subjects'}
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
											|| gradesLevels.length === 0
											|| activePlans.length === 0
										}
									>
										{isSaving ? 'Adding…' : 'Add student'}
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
