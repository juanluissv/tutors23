import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetPlanSubscriptionsQuery } from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { getGradeLevelLabel } from '../../utils/gradeLevel'
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

function formatDisplayDate (value) {
	if (!value) {
		return '—'
	}
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) {
		return '—'
	}
	return d.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
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

function formatStudentName (firstname, lastname) {
	return [
		formatNamePart(firstname),
		formatNamePart(lastname),
	].filter(Boolean).join(' ')
}

function studentInitials (firstname, lastname) {
	const first = formatNamePart(firstname).charAt(0)
	const last = formatNamePart(lastname).charAt(0)
	return (first + last) || '?'
}

function summarizeSubjects (subjects, maxLabels = 4) {
	const list = Array.isArray(subjects) ? subjects : []
	const titles = list
		.map((s) =>
			s && typeof s === 'object' && s.title ? String(s.title) : null,
		)
		.filter(Boolean)
	if (titles.length === 0) {
		return 'No subjects linked'
	}
	const shown = titles.slice(0, maxLabels)
	const extra = titles.length - shown.length
	const suffix = extra > 0 ? ` +${extra} more` : ''
	return `${shown.join(' · ')}${suffix}`
}

function subscriptionStatusLabel (subscription) {
	if (!subscription) {
		return { label: 'No subscription', tone: 'muted' }
	}
	if (subscription.pastDue) {
		return { label: 'Past due', tone: 'warning' }
	}
	if (subscription.active) {
		return { label: 'Active', tone: 'active' }
	}
	return { label: 'Inactive', tone: 'muted' }
}

function usagePercent (subscription) {
	if (!subscription) {
		return 0
	}
	const total = Number(subscription.totalQuestions) || 0
	const asked = Number(subscription.questionsAsked) || 0
	if (total <= 0) {
		return 0
	}
	return Math.min(100, Math.round((asked / total) * 100))
}

function SchoolAdminSubscriptionsScreen () {
	const { planId } = useParams()
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

	const {
		data,
		isLoading,
		isError,
		refetch,
	} = useGetPlanSubscriptionsQuery(String(planId), {
		skip: !isValidPlanParam,
	})

	const plan = data?.plan ?? null
	const students = useMemo(
		() => (Array.isArray(data?.students) ? data.students : []),
		[data?.students],
	)
	const summary = data?.summary ?? {
		totalStudents: 0,
		activeSubscriptions: 0,
		totalSubscriptions: 0,
	}

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
						<div className='content-area'>
							<div className='plan-subscriptions-page'>
								<div className='plan-subscriptions-page__empty'>
									<p>Invalid plan link.</p>
									<Link
										to='/schooladmins/plans'
										className='teacher-subjects-page__add-btn'
									>
										Back to plans
									</Link>
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
						<div className='plan-subscriptions-page'>
							<div className='plan-subscriptions-page__top'>
								<Link
									to='/schooladmins/plans'
									className='plan-subscriptions-page__back'
								>
									<span aria-hidden>←</span>
									All plans
								</Link>
							</div>

							{isLoading && (
								<p className='teacher-subjects-page__subtitle'>
									Loading subscribers…
								</p>
							)}

							{isError && !isLoading && (
								<div className='plan-subscriptions-page__empty'>
									<p>We couldn&apos;t load subscribers for this plan.</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Try again
									</button>
								</div>
							)}

							{!isLoading && !isError && plan && (
								<>
									<section
										className='plan-subscriptions-hero'
										aria-label='Plan summary'
									>
										<div
											className='plan-subscriptions-hero__orb'
											aria-hidden
										/>
										<div
											className={
												'plan-subscriptions-hero__orb ' +
												'plan-subscriptions-hero__orb--sm'
											}
											aria-hidden
										/>
										<div className='plan-subscriptions-hero__content'>
											<div className='plan-subscriptions-hero__head'>
												<div>
													<p className='plan-subscriptions-hero__eyebrow'>
														Plan subscribers
													</p>
													<h1 className='plan-subscriptions-hero__title heading-gradient'>
														{formatCurrency(plan.price)}
													</h1>
													<p className='plan-subscriptions-hero__meta'>
														{plan.totalQuestions ?? '—'}{' '}
														questions ·{' '}
														{getGradeLevelLabel(
															plan.gradesLevel,
															'All grades',
														)}
														{' · '}
														{plan.active === true
															? 'Active plan'
															: 'Inactive plan'}
													</p>
												</div>
												<span
													className={
														'plan-subscriptions-hero__status ' +
														(plan.active === true
															? 'plan-subscriptions-hero__status--active'
															: 'plan-subscriptions-hero__status--inactive')
													}
												>
													{plan.active === true
														? 'Live'
														: 'Paused'}
												</span>
											</div>
											<p className='plan-subscriptions-hero__subjects'>
												{summarizeSubjects(plan.subjects)}
											</p>
											<div className='plan-subscriptions-hero__actions'>
												<Link
													to={`/schooladmins/updateplan/${planId}`}
													className='plan-subscriptions-hero__btn'
												>
													Edit plan
												</Link>
											</div>
										</div>
									</section>

									<div className='plan-subscriptions-stats'>
										<article className='plan-subscriptions-stat'>
											<span className='plan-subscriptions-stat__value'>
												{summary.totalStudents}
											</span>
											<span className='plan-subscriptions-stat__label'>
												{summary.totalStudents === 1
													? 'Subscriber'
													: 'Subscribers'}
											</span>
										</article>
										<article className='plan-subscriptions-stat'>
											<span className='plan-subscriptions-stat__value'>
												{summary.activeSubscriptions}
											</span>
											<span className='plan-subscriptions-stat__label'>
												Active now
											</span>
										</article>
										<article className='plan-subscriptions-stat'>
											<span className='plan-subscriptions-stat__value'>
												{summary.totalSubscriptions}
											</span>
											<span className='plan-subscriptions-stat__label'>
												Total subscriptions
											</span>
										</article>
									</div>

									<section
										className='plan-subscriptions-roster'
										aria-label='Students subscribed to this plan'
									>
										<div className='plan-subscriptions-roster__header'>
											<h2 className='plan-subscriptions-roster__title'>
												Students on this plan
											</h2>
											<span
												className='plan-subscriptions-roster__count'
												aria-label={`${students.length} students`}
											>
												{students.length}
											</span>
										</div>

										{students.length === 0 && (
											<div className='plan-subscriptions-roster__empty'>
												<p>
													No students have subscribed to this plan
													yet. Assign the plan when adding students,
													then they can activate it from their account.
												</p>
												{schoolId && (
													<Link
														to='/schooladmins/addstudents'
														className='teacher-subjects-page__add-btn'
													>
														<span
															className='teacher-subjects-page__add-btn-icon'
															aria-hidden
														>
															+
														</span>
														<span>Add a student</span>
													</Link>
												)}
											</div>
										)}

										{students.length > 0 && (
											<ul className='plan-subscriptions-roster__list'>
												{students.map((student) => {
													const id = String(student._id)
													const displayName = formatStudentName(
														student.firstname,
														student.lastname,
													)
													const sub = student.subscription
													const status = subscriptionStatusLabel(sub)
													const percent = usagePercent(sub)
													const gradeName = getGradeLevelLabel(
														student.gradesLevel,
														'—',
													)

													return (
														<li
															key={id}
															className='plan-subscriptions-roster__item'
														>
															<div
																className='plan-subscriptions-roster__avatar'
																aria-hidden='true'
															>
																{studentInitials(
																	student.firstname,
																	student.lastname,
																)}
															</div>
															<div className='plan-subscriptions-roster__main'>
																<div className='plan-subscriptions-roster__row'>
																	<div className='plan-subscriptions-roster__identity'>
																		<span className='plan-subscriptions-roster__name'>
																			{displayName}
																		</span>
																		<span className='plan-subscriptions-roster__email'>
																			{student.email}
																		</span>
																		<span className='plan-subscriptions-roster__grade'>
																			{gradeName}
																		</span>
																	</div>
																	<span
																		className={
																			'plan-subscriptions-roster__badge ' +
																			`plan-subscriptions-roster__badge--${status.tone}`
																		}
																	>
																		{status.label}
																	</span>
																</div>

																{sub && (
																	<div className='plan-subscriptions-roster__usage'>
																		<div className='plan-subscriptions-roster__usage-head'>
																			<span>
																				{sub.questionsAsked ?? 0}{' '}
																				of {sub.totalQuestions ?? 0}{' '}
																				questions used
																			</span>
																			<span>
																				{sub.questionsLeft ?? 0} left
																			</span>
																		</div>
																		<div
																			className='plan-subscriptions-roster__usage-track'
																			role='progressbar'
																			aria-valuenow={percent}
																			aria-valuemin={0}
																			aria-valuemax={100}
																			aria-label={
																				`${percent}% of questions used`
																			}
																		>
																			<div
																				className='plan-subscriptions-roster__usage-fill'
																				style={{
																					width: `${percent}%`,
																				}}
																			/>
																		</div>
																	</div>
																)}

																<div className='plan-subscriptions-roster__dates'>
																	<span>
																		Started{' '}
																		{formatDisplayDate(sub?.startDate)}
																	</span>
																	<span>
																		Renews / ends{' '}
																		{formatDisplayDate(sub?.endDate)}
																	</span>
																	{sub?.renewal && (
																		<span className='plan-subscriptions-roster__renewal'>
																			Auto-renew on
																		</span>
																	)}
																</div>
															</div>
														</li>
													)
												})}
											</ul>
										)}
									</section>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminSubscriptionsScreen
