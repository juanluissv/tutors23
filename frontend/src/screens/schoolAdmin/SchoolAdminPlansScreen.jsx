import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
	useGetPlansBySchoolQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
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

function summarizeSubjects (subjects, maxLabels = 3) {
	const list = Array.isArray(subjects) ? subjects : []
	const titles = list
		.map((s) =>
			s && typeof s === 'object' && s.title ? String(s.title) : null,
		)
		.filter(Boolean)
	if (titles.length === 0) {
		return 'No subjects'
	}
	const shown = titles.slice(0, maxLabels)
	const extra = titles.length - shown.length
	const suffix = extra > 0 ? ` +${extra} more` : ''
	return `${shown.join(' · ')}${suffix}`
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

	const hasSubjects = subjects.length > 0
	const isPageLoading = isLoading || isSubjectsLoading

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
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											view and manage subscription plans.
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
					<div className='content-area'>
						<div className='teacher-subjects-page'>
							<h1 className='teacher-subjects-page__title heading-gradient'>
								School plans
							</h1>
							<p className='teacher-subjects-page__subtitle'>
								All subscription plans for your school. Each plan sets
								price, included question quota, and linked subjects.
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
										<span>Create plan</span>
									</Link>
								</div>
							)}

							{isPageLoading && (
								<p className='teacher-subjects-page__subtitle'>
									Loading plans…
								</p>
							)}

							{isError && !isPageLoading && (
								<div className='teacher-subjects-page__subtitle'>
									<p>We couldn&apos;t load plans.</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Try again
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
										Add at least one subject before you can
										create a subscription plan.
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
										<span>Create your first subject</span>
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
										No plans yet. Start by creating your
										first subscription plan.
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
										<span>Create your first plan</span>
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
										const active = plan.active === true
										const studentCount =
											typeof plan.studentCount === 'number'
												? plan.studentCount
												: 0
										const subjectCount =
											Array.isArray(plan.subjects)
												? plan.subjects.length
												: 0
										const questions =
											plan.totalQuestions ?? '—'

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
																? 'student'
																: 'students'}
														</span>
														<p className='teacher-subject-card__meta'>
															{questions}{' '}
															questions included
															{' · '}
															{subjectCount}{' '}
															{subjectCount === 1
																? 'subject'
																: 'subjects'}
															{' · '}
															{active ? 'Active' : 'Inactive'}
														</p>
													</div>
													<div className='teacher-subject-card__badge'>
														<ClipboardIcon />
													</div>
												</div>

												<p className='teacher-subject-card__excerpt'>
													{summarizeSubjects(plan.subjects)}
												</p>

												<div className='teacher-subject-card__divider' />

												<div className='teacher-subject-card__actions'>
													<div className='teacher-subject-card__row'>
														<Link
															to={`/schooladmins/subscriptions/${id}`}
															className='teacher-subject-card__btn'
														>
															Subscribers
														</Link>
														<Link
															to={`/schooladmins/updateplan/${id}`}
															className='teacher-subject-card__btn'
														>
															Edit plan
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
