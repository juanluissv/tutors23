import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetProfileQuery,
	useUpdateProfileMutation,
} from '../../slices/student/studentApiSlice'
import { setStudentCredentials } from '../../slices/student/authStudentSlice'
import '../../App.css'

const PROFILE_TAB = 'profile'
const SUBSCRIPTION_TAB = 'subscription'

function resolveCurrentSubscription (subscriptions) {
	const list = Array.isArray(subscriptions) ? subscriptions : []
	if (list.length === 0) {
		return null
	}
	const active = list.filter((sub) => sub?.active === true)
	const pool = active.length > 0 ? active : list
	return [...pool].sort((a, b) => {
		const aTime = new Date(a?.createdAt || 0).getTime()
		const bTime = new Date(b?.createdAt || 0).getTime()
		return bTime - aTime
	})[0]
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
		month: 'long',
		day: 'numeric',
	})
}

function computeDaysUntilRenewal (endDate) {
	if (!endDate) {
		return null
	}
	const end = new Date(endDate)
	if (Number.isNaN(end.getTime())) {
		return null
	}
	const startOfDay = (date) => {
		const d = new Date(date)
		d.setHours(0, 0, 0, 0)
		return d
	}
	const msPerDay = 1000 * 60 * 60 * 24
	const diff = Math.round(
		(startOfDay(end).getTime() - startOfDay(new Date()).getTime())
			/ msPerDay,
	)
	return Math.max(0, diff)
}

function formatRenewalDaysLabel (subscription) {
	const days =
		subscription?.daysUntilRenewal ?? computeDaysUntilRenewal(
			subscription?.endDate,
		)
	if (days == null) {
		return '—'
	}
	if (subscription?.pastDue) {
		return 'Past due — renew now'
	}
	if (subscription?.renewal === false) {
		if (days === 0) {
			return 'Expires today'
		}
		if (days === 1) {
			return '1 day until expiration'
		}
		return `${days} days until expiration`
	}
	if (days === 0) {
		return 'Renews today'
	}
	if (days === 1) {
		return '1 day until renewal'
	}
	return `${days} days until renewal`
}

function formatPlanCurrency (price) {
	const n = Number(price)
	if (Number.isNaN(n)) {
		return '—'
	}
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
			maximumFractionDigits: 2,
		}).format(n)
	} catch {
		return `$${n}`
	}
}

function getPlanDisplayName (plan) {
	const gradeName = plan?.gradesLevel?.name
	if (gradeName) {
		return `${gradeName} Plan`
	}
	return 'Learning Plan'
}

function getSubjectTitles (plan) {
	const subjects = Array.isArray(plan?.subjects) ? plan.subjects : []
	return subjects
		.map((subject) => {
			if (subject != null && typeof subject === 'object') {
				return String(subject.title || '').trim()
			}
			return ''
		})
		.filter(Boolean)
}

function SubscriptionDetailRow ({ label, value, highlight }) {
	return (
		<div className='student-profile-sub__row'>
			<span className='student-profile-sub__label'>{label}</span>
			<span
				className={
					'student-profile-sub__value' +
					(highlight ? ' student-profile-sub__value--highlight' : '')
				}
			>
				{value}
			</span>
		</div>
	)
}

function StudentSubscriptionPanel ({ subscription, hasPlans }) {
	if (!subscription) {
		return (
			<div className='student-profile-sub student-profile-sub--empty'>
				<p className='student-profile-sub__empty-title'>
					No active subscription
				</p>
				<p className='student-profile-sub__empty-text'>
					{hasPlans
						? 'Subscribe to your assigned plan to unlock full access.'
						: 'Contact your school admin to get a plan assigned to your account.'}
				</p>
				{hasPlans ? (
					<Link
						to='/students/subscription'
						className='student-profile-sub__cta'
					>
						Subscribe now
					</Link>
				) : null}
			</div>
		)
	}

	const plan = subscription.plan
	const planName = plan ? getPlanDisplayName(plan) : '—'
	const subjectTitles = plan ? getSubjectTitles(plan) : []
	const asked = Number(subscription.questionsAsked) || 0
	const total = Number(subscription.totalQuestions) || 0
	const left = Number(subscription.questionsLeft) || 0
	const usedPct =
		total > 0 ? Math.min(100, Math.round((asked / total) * 100)) : 0
	const daysUntilRenewal =
		subscription.daysUntilRenewal
		?? computeDaysUntilRenewal(subscription.endDate)
	const renewalDaysLabel = formatRenewalDaysLabel(subscription)
	const isRenewalUrgent =
		subscription.pastDue
		|| (daysUntilRenewal != null && daysUntilRenewal <= 3)

	return (
		<div className='student-profile-sub'>
			<div className='student-profile-sub__hero'>
				<div className='student-profile-sub__hero-top'>
					<h2 className='student-profile-sub__plan-name'>
						{planName}
					</h2>
					<span
						className={
							'student-profile-sub__status' +
							(subscription.active
								? ' student-profile-sub__status--active'
								: ' student-profile-sub__status--inactive')
						}
					>
						{subscription.active ? 'Active' : 'Inactive'}
					</span>
				</div>
				{plan?.price != null && (
					<p className='student-profile-sub__price'>
						{formatPlanCurrency(plan.price)}
						<span className='student-profile-sub__price-per'>
							/month
						</span>
					</p>
				)}
				{daysUntilRenewal != null && (
					<div
						className={
							'student-profile-sub__renewal' +
							(isRenewalUrgent
								? ' student-profile-sub__renewal--urgent'
								: '')
						}
					>
						<span className='student-profile-sub__renewal-value'>
							{subscription.pastDue ? '0' : String(daysUntilRenewal)}
						</span>
						<span className='student-profile-sub__renewal-copy'>
							<span className='student-profile-sub__renewal-label'>
								{subscription.pastDue
									? 'Renewal overdue'
									: subscription.renewal === false
										? 'Days until expiration'
										: 'Days until renewal'}
							</span>
							<span className='student-profile-sub__renewal-detail'>
								{renewalDaysLabel}
								{subscription.endDate
									? ` · ${formatDisplayDate(subscription.endDate)}`
									: ''}
							</span>
						</span>
					</div>
				)}
			</div>

			{total > 0 && (
				<div className='student-profile-sub__usage'>
					<div className='student-profile-sub__usage-head'>
						<span>Questions this period</span>
						<span>
							{asked} used · {left} left · {total} total
						</span>
					</div>
					<div
						className='student-profile-sub__usage-bar'
						role='progressbar'
						aria-valuenow={usedPct}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label='Questions used'
					>
						<div
							className='student-profile-sub__usage-fill'
							style={{ width: `${usedPct}%` }}
						/>
					</div>
				</div>
			)}

			<div className='student-profile-sub__grid'>
				<SubscriptionDetailRow
					label='Start date'
					value={formatDisplayDate(subscription.startDate)}
				/>
				<SubscriptionDetailRow
					label='End date'
					value={formatDisplayDate(subscription.endDate)}
				/>
				<SubscriptionDetailRow
					label={
						subscription.renewal === false
							? 'Days until expiration'
							: 'Days until renewal'
					}
					value={renewalDaysLabel}
					highlight={
						daysUntilRenewal != null
						&& daysUntilRenewal > 0
						&& !subscription.pastDue
					}
				/>
				<SubscriptionDetailRow
					label='Questions asked'
					value={String(asked)}
				/>
				<SubscriptionDetailRow
					label='Questions left'
					value={String(left)}
					highlight={left > 0}
				/>
				<SubscriptionDetailRow
					label='Total questions'
					value={String(total)}
				/>
				<SubscriptionDetailRow
					label='Auto-renewal'
					value={subscription.renewal ? 'Enabled' : 'Disabled'}
				/>
				<SubscriptionDetailRow
					label='Payment status'
					value={subscription.pastDue ? 'Past due' : 'Up to date'}
					highlight={!subscription.pastDue}
				/>
				<SubscriptionDetailRow
					label='Subscribed on'
					value={formatDisplayDate(subscription.createdAt)}
				/>
				{plan?.active !== undefined && (
					<SubscriptionDetailRow
						label='Plan status'
						value={plan.active !== false ? 'Available' : 'Inactive'}
					/>
				)}
			</div>

			{subjectTitles.length > 0 && (
				<div className='student-profile-sub__subjects'>
					<span className='student-profile-sub__subjects-label'>
						Included subjects
					</span>
					<ul className='student-profile-sub__subjects-list'>
						{subjectTitles.map((title) => (
							<li key={title}>{title}</li>
						))}
					</ul>
				</div>
			)}

			{subscription.active && (
				<Link
					to='/students/subscription'
					className='student-profile-sub__manage-link'
				>
					Manage subscription
				</Link>
			)}
		</div>
	)
}

function StudentProfileScreen () {
	const dispatch = useDispatch()
	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [city, setCity] = useState('')
	const [country, setCountry] = useState('')
	const [birthDate, setBirthDate] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [activeTab, setActiveTab] = useState(PROFILE_TAB)

	const {
		data: profile,
		isLoading,
		isError,
		error,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()

	useEffect(() => {
		if (!profile) {
			return
		}
		setFirstname(profile.firstname ?? '')
		setLastname(profile.lastname ?? '')
		setEmail(profile.email ?? '')
		setCity(profile.city ?? '')
		setCountry(profile.country ?? '')
		setBirthDate(profile.birthDate ?? '')
	}, [profile])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const fn = firstname?.trim() || ''
	const ln = lastname?.trim() || ''
	const initials = `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase()

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (fn === '' || ln === '') {
			toast.error('First and last name are required')
			return
		}
		if (newPassword !== '' || confirmPassword !== '') {
			if (newPassword.length < 6) {
				toast.error('New password must be at least 6 characters')
				return
			}
			if (newPassword !== confirmPassword) {
				toast.error('Passwords do not match')
				return
			}
		}

		const body = {
			firstname: fn,
			lastname: ln,
			email: email.trim(),
			city: city.trim(),
			country: country.trim(),
			birthDate: birthDate.trim() === '' ? '' : birthDate.trim(),
		}
		if (newPassword.trim() !== '') {
			body.password = newPassword
		}

		try {
			const updated = await updateProfile(body).unwrap()
			dispatch(
				setStudentCredentials({
					...studentInfo,
					_id: updated._id,
					firstname: updated.firstname,
					lastname: updated.lastname,
					username: updated.username ?? studentInfo?.username,
					email: updated.email,
					country: updated.country,
					city: updated.city,
					subscriptions: updated.subscriptions,
					subjects: updated.subjects ?? studentInfo?.subjects ?? [],
				}),
			)
			setNewPassword('')
			setConfirmPassword('')
			toast.success('Profile updated successfully')
		} catch (err) {
			toast.error(err?.data?.message || err?.error || 'Update failed')
		}
	}

	const subjects = profile?.subjects ?? []
	const plans = profile?.plans ?? []
	const currentSubscription = useMemo(
		() => resolveCurrentSubscription(profile?.subscriptions),
		[profile?.subscriptions],
	)
	const isBusy = isSaving
	const showContent = !isLoading && !isError && profile

	return (
		<div className='chat-app ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login content-area--login-scroll'>
						<div
							className={
								'center-content2 login-screen login-screen--wide'
							}
						>
							<div className='login-card'>
								<div
									className='login-card__accent'
									aria-hidden
								/>
								<div className='login-card__header'>
									<div className='tp-avatar-wrapper'>
										<div className='tp-avatar'>
											{initials}
										</div>
									</div>
									<h1 className='login-card__title'>
										My profile
									</h1>
									<p
										className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
									>
										{activeTab === PROFILE_TAB
											? 'View and update your account details.'
											: 'View your current subscription and usage.'}
									</p>
								</div>

								{showContent && (
									<nav
										className='student-profile-tabs'
										role='tablist'
										aria-label='Profile sections'
									>
										<button
											type='button'
											role='tab'
											id='student-profile-tab-profile'
											aria-selected={activeTab === PROFILE_TAB}
											aria-controls='student-profile-panel-profile'
											className={
												'student-profile-tabs__btn' +
												(activeTab === PROFILE_TAB
													? ' student-profile-tabs__btn--active'
													: '')
											}
											onClick={() =>
												setActiveTab(PROFILE_TAB)}
										>
											Profile
										</button>
										<button
											type='button'
											role='tab'
											id='student-profile-tab-subscription'
											aria-selected={
												activeTab === SUBSCRIPTION_TAB
											}
											aria-controls={
												'student-profile-panel-subscription'
											}
											className={
												'student-profile-tabs__btn' +
												(activeTab === SUBSCRIPTION_TAB
													? ' student-profile-tabs__btn--active'
													: '')
											}
											onClick={() =>
												setActiveTab(SUBSCRIPTION_TAB)}
										>
											My subscription
										</button>
									</nav>
								)}

								{!studentInfo && (
									<p className='login-card__subtitle'>
										<Link to='/login'>Sign in</Link>
										{' '}
										to manage your profile.
									</p>
								)}

								{studentInfo && isLoading && (
									<p className='login-card__subtitle'>
										Loading profile…
									</p>
								)}

								{studentInfo && isError && (
									<p
										className='login-card__subtitle'
										role='alert'
									>
										{error?.data?.message
											|| error?.error
											|| 'Could not load profile.'}
									</p>
								)}

								{showContent && activeTab === PROFILE_TAB && (
								<div
									role='tabpanel'
									id='student-profile-panel-profile'
									aria-labelledby='student-profile-tab-profile'
								>
								<form
									className='login-form'
									id='student-profile-form'
									name='student-profile-form'
									onSubmit={handleSubmit}
								>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-first-name'
											>
												First name
											</label>
											<input
												type='text'
												id='sp-first-name'
												name='firstname'
												className='login-input'
												placeholder='First name'
												autoComplete='given-name'
												value={firstname}
												disabled={isBusy}
												onChange={(e) =>
													setFirstname(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-last-name'
											>
												Last name
											</label>
											<input
												type='text'
												id='sp-last-name'
												name='lastname'
												className='login-input'
												placeholder='Last name'
												autoComplete='family-name'
												value={lastname}
												disabled={isBusy}
												onChange={(e) =>
													setLastname(e.target.value)}
											/>
										</div>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='sp-username'
										>
											Username
										</label>
										<input
											type='text'
											id='sp-username'
											name='username'
											className='login-input'
											value={profile?.username ?? ''}
											readOnly
											disabled
											aria-readonly='true'
										/>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='sp-email'
										>
											Email address
										</label>
										<input
											type='email'
											id='sp-email'
											name='email'
											className='login-input'
											placeholder='you@example.com'
											autoComplete='email'
											value={email}
											disabled={isBusy}
											onChange={(e) =>
												setEmail(e.target.value)}
										/>
									</div>

									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-city'
											>
												City
											</label>
											<input
												type='text'
												id='sp-city'
												name='city'
												className='login-input'
												placeholder='City'
												autoComplete='address-level2'
												value={city}
												disabled={isBusy}
												onChange={(e) =>
													setCity(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-country'
											>
												Country
											</label>
											<input
												type='text'
												id='sp-country'
												name='country'
												className='login-input'
												placeholder='Country'
												autoComplete='country-name'
												value={country}
												disabled={isBusy}
												onChange={(e) =>
													setCountry(e.target.value)}
											/>
										</div>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='sp-birth-date'
										>
											Birth date (optional)
										</label>
										<input
											type='date'
											id='sp-birth-date'
											name='birthDate'
											className='login-input'
											autoComplete='bday'
											value={birthDate}
											disabled={isBusy}
											onChange={(e) =>
												setBirthDate(e.target.value)}
										/>
									</div>

									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-new-password'
											>
												New password
											</label>
											<input
												type='password'
												id='sp-new-password'
												name='newPassword'
												className='login-input'
												placeholder={
													'Leave blank to keep current'
												}
												autoComplete='new-password'
												value={newPassword}
												disabled={isBusy}
												onChange={(e) =>
													setNewPassword(
														e.target.value,
													)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-confirm-password'
											>
												Confirm new password
											</label>
											<input
												type='password'
												id='sp-confirm-password'
												name='confirmPassword'
												className='login-input'
												placeholder='Confirm'
												autoComplete='new-password'
												value={confirmPassword}
												disabled={isBusy}
												onChange={(e) =>
													setConfirmPassword(
														e.target.value,
													)}
											/>
										</div>
									</div>

									{subjects.length > 0 && (
										<div className='login-field'>
											<span className='login-label'>
												Your subjects
											</span>
											<ul
												className='login-card__subtitle'
												style={{
													margin: '0.5rem 0 0',
													paddingLeft: '1.25rem',
												}}
											>
												{subjects.map((sub) => (
													<li key={sub._id}>
														{sub.title
															|| 'Untitled subject'}
													</li>
												))}
											</ul>
										</div>
									)}

									<button
										type='submit'
										className='login-submit'
										disabled={isBusy}
									>
										{isBusy ? 'Saving…' : 'Save changes'}
									</button>
								</form>
								</div>
								)}

								{showContent && activeTab === SUBSCRIPTION_TAB && (
									<div
										role='tabpanel'
										id='student-profile-panel-subscription'
										aria-labelledby={
											'student-profile-tab-subscription'
										}
										className='student-profile-sub-panel'
									>
										<StudentSubscriptionPanel
											subscription={currentSubscription}
											hasPlans={plans.length > 0}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentProfileScreen
