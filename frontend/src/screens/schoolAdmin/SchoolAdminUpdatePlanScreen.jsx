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
import { getGradeLevelLabel, getSubjectGradeLevelNames } from '../../utils/gradeLevel'
import '../../App.css'

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

	const planGradeLabel = useMemo(
		() => getGradeLevelLabel(plan?.gradesLevel, 'Not set'),
		[plan],
	)

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
		const ids = Array.isArray(plan.subjects)
			? plan.subjects.map((s) =>
				String(typeof s === 'object' && s?._id ? s._id : s),
			)
			: []
		setSelectedSubjectIds(ids)
		setFormReady(true)
	}, [plan])

	const handleToggleSubject = (subjectId) => {
		const id = String(subjectId)
		setSelectedSubjectIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!isValidPlanParam) {
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

		if (selectedSubjectIds.length === 0) {
			toast.error('Select at least one subject included in this plan')
			return
		}

		try {
			await updatePlan({
				id: String(planId),
				price: priceNum,
				totalQuestions: totalNum,
				subjects: selectedSubjectIds,
				active: isPlanActive,
			}).unwrap()
			toast.success('Plan updated')
			navigate('/schooladmins/plans', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not update plan',
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
											edit subscription plans.
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
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											Invalid plan
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											This plan link is not valid.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
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
					<div className='content-area content-area--login content-area--login-scroll'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>										
										Edit plan
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										View and update this subscription plan. Change
										price, question quota, included subjects, or
										whether the plan is active.
										{' '}
										<Link to='/schooladmins/plans'>
											Back to plans
										</Link>
									</p>
								</div>

								{planLoading && (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading plan…
									</p>
								)}

								{planError && !planLoading && (
									<div className='login-field'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											We couldn&apos;t load this plan.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchPlan()}
										>
											Try again
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
													? 'student'
													: 'students'}{' '}
												on this plan
											</p>
										)}
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-update-plan-price'
											>
												Price
											</label>
											<input
												type='number'
												id='schooladmin-update-plan-price'
												name='price'
												className='login-input'
												placeholder='e.g. 29.99'
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
												Total questions
											</label>
											<input
												type='number'
												id='schooladmin-update-plan-questions'
												name='totalQuestions'
												className='login-input'
												placeholder='e.g. 50'
												min={1}
												step={1}
												autoComplete='off'
												value={totalQuestions}
												disabled={isBusy}
												onChange={(e) =>
													setTotalQuestions(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<span
												className='login-label'
												id='schooladmin-update-plan-grade-label'
											>
												Grade level
											</span>
											<div
												className='plan-grade-level'
												role='group'
												aria-labelledby='schooladmin-update-plan-grade-label'
											>
												<span
													className='plan-grade-level__badge'
													aria-label={`Plan grade level: ${planGradeLabel}`}
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
														{planGradeLabel}
													</span>
												</span>
												<p className='plan-grade-level__hint'>
													Set when this plan was created and
													cannot be changed here.
												</p>
											</div>
										</div>
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
														disabled={isBusy}
														onClick={() => refetchSubjects()}
													>
														Retry loading subjects
													</button>
												</div>
											)}
											{!subjectsBusy && subjectsList.length === 0 && (
												<p className='login-card__subtitle login-card__subtitle--wide'>
													No subjects yet.{' '}
													<Link to='/schooladmins/createsubject'>
														Create a subject
													</Link>{' '}
													first.
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
													aria-label='Subjects included in plan'
												>
													{subjectsList.map((sub) => {
														const sid = String(sub._id)
														const gradeLabel = (() => {
															const names = getSubjectGradeLevelNames(
																sub.gradesLevel,
															)
															return names !== ''
																? ` · Grade ${names}`
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
													Plan is active
												</span>
											</label>
										</div>
										<button
											type='submit'
											id='schooladmin-update-plan-submit'
											className='login-submit'
											disabled={
												isBusy
												|| subjectsBusy
												|| subjectsList.length === 0
											}
										>
											{isSaving ? 'Saving…' : 'Save changes'}
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
