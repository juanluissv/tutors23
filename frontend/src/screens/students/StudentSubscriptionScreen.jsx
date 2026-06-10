import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetProfileQuery,
	useSubscribeMutation,
} from '../../slices/student/studentApiSlice'
import { setStudentCredentials } from '../../slices/student/authStudentSlice'
import '../../App.css'

const PLAN_FEATURES = [
	{
		id: 'ai',
		label: 'Unlimited access to the AI tutor',
		tone: 'violet',
	},
	{
		id: 'book',
		label: 'Digital class book for every subject',
		tone: 'sky',
	},
	{
		id: 'live',
		label: 'Interactive live classes with teachers',
		tone: 'rose',
	},
	{
		id: 'record',
		label: 'Record your screen or camera to ask questions',
		tone: 'amber',
	},
]

function resolvePrimaryPlan (plans, planIdFromQuery) {
	const list = Array.isArray(plans) ? plans : []
	if (list.length === 0) {
		return null
	}
	if (planIdFromQuery) {
		const match = list.find(
			(plan) => String(plan?._id) === String(planIdFromQuery),
		)
		if (match) {
			return match
		}
	}
	const activePlan = list.find((plan) => plan?.active !== false)
	return activePlan ?? list[0]
}

function getPlanDisplayName (plan) {
	const gradeName = plan?.gradesLevel?.name
	if (gradeName) {
		return `${gradeName} Plan`
	}
	return 'Learning Plan'
}

function getPlanTagline (plan) {
	const totalQuestions = Number(plan?.totalQuestions)
	if (!Number.isNaN(totalQuestions) && totalQuestions > 0) {
		return `Ask up to ${totalQuestions} questions each month`
	}
	return 'Everything you need to learn smarter'
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

function formatPlanPriceAmount (price) {
	const n = Number(price)
	if (Number.isNaN(n)) {
		return '—'
	}
	return Number.isInteger(n) ? String(n) : n.toFixed(2)
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

const formatCardNumber = (value) => {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 19)
	return digits.replace(/(.{4})/g, '$1 ').trim()
}

const formatExpiry = (value) => {
	const digits = String(value || '').replace(/\D/g, '').slice(0, 4)
	if (digits.length < 3) {
		return digits
	}
	return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

const sanitizeCvv = (value) => {
	return String(value || '').replace(/\D/g, '').slice(0, 4)
}

const detectBrand = (cardNumber) => {
	const digits = String(cardNumber || '').replace(/\D/g, '')
	if (/^4/.test(digits)) {
		return 'visa'
	}
	if (/^(5[1-5]|2[2-7])/.test(digits)) {
		return 'mastercard'
	}
	if (/^3[47]/.test(digits)) {
		return 'amex'
	}
	if (/^6(?:011|5)/.test(digits)) {
		return 'discover'
	}
	return 'generic'
}

const FeatureIcon = ({ id }) => {
	if (id === 'ai') {
		return (
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				aria-hidden
			>
				<path
					d='M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z'
					fill='currentColor'
				/>
				<circle cx='18.5' cy='17.5' r='1.5' fill='currentColor' />
				<circle cx='5.5' cy='18' r='1' fill='currentColor' />
			</svg>
		)
	}
	if (id === 'book') {
		return (
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				aria-hidden
			>
				<path
					d='M5 4.5A1.5 1.5 0 016.5 3H18a1 1 0 011 1v15a1 1 0 01-1 1H6.5A1.5 1.5 0 015 18.5v-14z'
					fill='currentColor'
					opacity='0.95'
				/>
				<path
					d='M9 8h6M9 11h6M9 14h4'
					stroke='#ffffff'
					strokeWidth='1.6'
					strokeLinecap='round'
				/>
			</svg>
		)
	}
	if (id === 'live') {
		return (
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				aria-hidden
			>
				<rect
					x='3'
					y='6'
					width='13'
					height='12'
					rx='2.5'
					fill='currentColor'
				/>
				<path
					d='M16 10l5-3v10l-5-3v-4z'
					fill='currentColor'
					opacity='0.85'
				/>
			</svg>
		)
	}
	if (id === 'record') {
		return (
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				aria-hidden
			>
				<circle cx='12' cy='11' r='4' fill='currentColor' />
				<path
					d='M6 18.5h12'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<path
					d='M9 21h6'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
				/>
			</svg>
		)
	}
	return null
}

const ChipIcon = () => (
	<svg
		width='32'
		height='24'
		viewBox='0 0 32 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect
			x='1'
			y='1'
			width='30'
			height='22'
			rx='4'
			fill='url(#chip-gradient)'
			stroke='rgba(255,255,255,0.4)'
		/>
		<path
			d='M7 7h18M7 12h18M7 17h18M11 4v16M21 4v16'
			stroke='rgba(0,0,0,0.18)'
			strokeWidth='0.6'
		/>
		<defs>
			<linearGradient
				id='chip-gradient'
				x1='0'
				y1='0'
				x2='32'
				y2='24'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#fde68a' />
				<stop offset='1' stopColor='#f59e0b' />
			</linearGradient>
		</defs>
	</svg>
)

const ContactlessIcon = () => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M7 5c3 2.5 3 11.5 0 14M11 4c4 3.5 4 12.5 0 16M15 3c5 4.5 5 13.5 0 18'
			stroke='rgba(255,255,255,0.85)'
			strokeWidth='1.6'
			strokeLinecap='round'
		/>
	</svg>
)

const BrandLogo = ({ brand }) => {
	if (brand === 'visa') {
		return (
			<span className='student-subscription-card__brand student-subscription-card__brand--visa'>
				VISA
			</span>
		)
	}
	if (brand === 'mastercard') {
		return (
			<span className='student-subscription-card__brand student-subscription-card__brand--mc'>
				<span className='student-subscription-card__mc-circle student-subscription-card__mc-circle--red' />
				<span className='student-subscription-card__mc-circle student-subscription-card__mc-circle--yellow' />
			</span>
		)
	}
	if (brand === 'amex') {
		return (
			<span className='student-subscription-card__brand student-subscription-card__brand--amex'>
				AMEX
			</span>
		)
	}
	if (brand === 'discover') {
		return (
			<span className='student-subscription-card__brand student-subscription-card__brand--disc'>
				DISCOVER
			</span>
		)
	}
	return (
		<span className='student-subscription-card__brand student-subscription-card__brand--generic'>
			CARD
		</span>
	)
}

const LockIcon = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect
			x='5'
			y='11'
			width='14'
			height='10'
			rx='2'
			stroke='currentColor'
			strokeWidth='1.75'
		/>
		<path
			d='M8 11V8a4 4 0 118 0v3'
			stroke='currentColor'
			strokeWidth='1.75'
			strokeLinecap='round'
		/>
	</svg>
)

const ShieldIcon = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z'
			stroke='currentColor'
			strokeWidth='1.75'
			strokeLinejoin='round'
		/>
		<path
			d='M9 12.5l2 2 4-4'
			stroke='currentColor'
			strokeWidth='1.75'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const SparkleIcon = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z'
			fill='currentColor'
		/>
	</svg>
)

const ArrowIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M5 12h14M13 6l6 6-6 6'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

function hasActiveSubscriptionForPlan (subscriptions, planId) {
	if (!planId) {
		return false
	}
	const list = Array.isArray(subscriptions) ? subscriptions : []
	return list.some((sub) => {
		const subPlanId =
			sub?.plan != null && typeof sub.plan === 'object'
				? sub.plan._id
				: sub?.plan
		return (
			sub?.active === true
			&& subPlanId != null
			&& String(subPlanId) === String(planId)
		)
	})
}

function StudentSubscriptionScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [searchParams] = useSearchParams()
	const planIdFromQuery = searchParams.get('plan')?.trim() || ''
	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [nameOnCard, setNameOnCard] = useState('Mark Winston')
	const [cardNumber, setCardNumber] = useState('42932 9826 3719 3783')
	const [expiry, setExpiry] = useState('05 / 27')
	const [cvv, setCvv] = useState('378')

	const {
		data: profile,
		isLoading: isLoadingProfile,
		isError: isProfileError,
		error: profileError,
		refetch: refetchProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation()

	const plan = useMemo(
		() => resolvePrimaryPlan(profile?.plans, planIdFromQuery),
		[profile?.plans, planIdFromQuery],
	)

	const planName = useMemo(
		() => (plan ? getPlanDisplayName(plan) : 'Learning Plan'),
		[plan],
	)

	const planTagline = useMemo(
		() => (plan ? getPlanTagline(plan) : 'Everything you need to learn smarter'),
		[plan],
	)

	const subjectTitles = useMemo(
		() => (plan ? getSubjectTitles(plan) : []),
		[plan],
	)

	const planPriceAmount = useMemo(
		() => formatPlanPriceAmount(plan?.price),
		[plan?.price],
	)

	const planPriceFormatted = useMemo(
		() => formatPlanCurrency(plan?.price),
		[plan?.price],
	)

	const totalQuestions = useMemo(() => {
		const n = Number(plan?.totalQuestions)
		return Number.isNaN(n) ? null : n
	}, [plan?.totalQuestions])

	const isAlreadySubscribed = useMemo(
		() =>
			hasActiveSubscriptionForPlan(
				profile?.subscriptions,
				plan?._id,
			),
		[profile?.subscriptions, plan?._id],
	)

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent('/students/subscription')
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!plan?._id) {
			toast.error('No plan selected')
			return
		}

		if (isAlreadySubscribed) {
			toast.info('You already have an active subscription for this plan')
			return
		}

		const cardDigits = String(cardNumber || '').replace(/\D/g, '')
		if (cardDigits.length < 13) {
			toast.error('Please enter a valid card number')
			return
		}
		if (!nameOnCard.trim()) {
			toast.error('Please enter the name on your card')
			return
		}

		try {
			const result = await subscribe({
				planId: plan._id,
				simulation: true,
			}).unwrap()

			dispatch(
				setStudentCredentials({
					...studentInfo,
					subscriptions: result.subscriptions ?? [],
				}),
			)

			await refetchProfile()

			toast.success(
				result.message || 'Payment successful! Your subscription is active.',
			)
			navigate('/students/profile')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error
					|| 'Payment could not be processed',
			)
		}
	}

	const handleCardNumberChange = (e) => {
		setCardNumber(formatCardNumber(e.target.value))
	}

	const handleExpiryChange = (e) => {
		setExpiry(formatExpiry(e.target.value))
	}

	const handleCvvChange = (e) => {
		setCvv(sanitizeCvv(e.target.value))
	}

	const brand = useMemo(() => detectBrand(cardNumber), [cardNumber])

	const previewNumber = useMemo(() => {
		const padded = (cardNumber || '').padEnd(19, '•')
		return padded.slice(0, 19)
	}, [cardNumber])

	const previewName = nameOnCard.trim() || 'Your Name'
	const previewExpiry = expiry || 'MM / YY'

	if (!studentInfo) {
		return null
	}

	return (
		<div className='chat-app'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--subscription'>
						<div className='student-subscription-page'>
							<header className='student-subscription-page__header'>
								{/* <span className='student-subscription-page__eyebrow'>
									<SparkleIcon />
									<span>Pricing</span>
								</span> */}
								<h1 className='student-subscription-page__title heading-gradient'>
									Subscribe to a plan
								</h1>
								{/* <p className='student-subscription-page__subtitle'>
									Unlock your full learning experience with one
									simple monthly subscription. Cancel anytime.
								</p> */}
							</header>

							{isLoadingProfile ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										Loading your plan…
									</p>
								</div>
							) : isProfileError ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										{profileError?.data?.message
											|| profileError?.error
											|| 'Could not load your plan.'}
									</p>
								</div>
							) : !plan ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										No subscription plan has been assigned to
										your account yet. Contact your school admin
										to get started.
									</p>
									<Link
										to='/students/profile'
										className='student-subscription-state__link'
									>
										Go to profile
									</Link>
								</div>
							) : (
							<div className='student-subscription-grid'>
								<article
									className='student-subscription-plan'
									aria-label='Subscription plan details'
								>
									<div
										className='student-subscription-plan__orb student-subscription-plan__orb--one'
										aria-hidden
									/>
									<div
										className='student-subscription-plan__orb student-subscription-plan__orb--two'
										aria-hidden
									/>
									<div
										className='student-subscription-plan__orb student-subscription-plan__orb--three'
										aria-hidden
									/>
									<div
										className='student-subscription-plan__grid'
										aria-hidden
									/>

									<div className='student-subscription-plan__inner'>
										<div className='student-subscription-plan__top'>
											<span className='student-subscription-plan__badge'>
												<SparkleIcon />
												<span>Most popular</span>
											</span>
											<span className='student-subscription-plan__pill'>
												Cancel anytime
											</span>
										</div>

										<div className='student-subscription-plan__head'>
											<h2 className='student-subscription-plan__name'>
												{planName}
											</h2>
											<p className='student-subscription-plan__tagline'>
												{planTagline}
											</p>
										</div>

										<div className='student-subscription-plan__price-block'>
											<p className='student-subscription-plan__price'>
												<span className='student-subscription-plan__currency'>
													$
												</span>
												<span className='student-subscription-plan__amount'>
													{planPriceAmount}
												</span>
												<span className='student-subscription-plan__per'>
													/month
												</span>
											</p>
											<p className='student-subscription-plan__bill'>
												Billed monthly. No hidden fees.
											</p>
										</div>

										{totalQuestions != null && (
											<div className='student-subscription-plan__meta'>
												<span className='student-subscription-plan__meta-label'>
													Monthly questions
												</span>
												<span className='student-subscription-plan__meta-value'>
													{totalQuestions}
												</span>
											</div>
										)}

										{subjectTitles.length > 0 && (
											<div className='student-subscription-plan__subjects'>
												<p className='student-subscription-plan__subjects-label'>
													Included subjects
												</p>
												<ul className='student-subscription-plan__subjects-list'>
													{subjectTitles.map((title) => (
														<li
															key={title}
															className='student-subscription-plan__subject'
														>
															{title}
														</li>
													))}
												</ul>
											</div>
										)}

										<ul className='student-subscription-plan__features'>
											{PLAN_FEATURES.map((feature) => (
												<li
													key={feature.id}
													className={`student-subscription-plan__feature student-subscription-plan__feature--${feature.tone}`}
												>
													<span
														className='student-subscription-plan__feature-icon'
														aria-hidden='true'
													>
														<FeatureIcon id={feature.id} />
													</span>
													<span className='student-subscription-plan__feature-text'>
														{feature.label}
													</span>
												</li>
											))}
										</ul>

										<div className='student-subscription-plan__guarantee'>
											<span
												className='student-subscription-plan__guarantee-icon'
												aria-hidden='true'
											>
												<ShieldIcon />
											</span>
											<div className='student-subscription-plan__guarantee-text'>
												<strong>30-day money-back guarantee</strong>
												<span>
													Not the right fit? Get a full refund,
													no questions asked.
												</span>
											</div>
										</div>
									</div>
								</article>

								<article
									className='student-subscription-payment'
									aria-label='Payment form'
								>
									<div className='student-subscription-payment__inner'>
										<div className='student-subscription-payment__head'>
											<div>
												<h2 className='student-subscription-payment__title'>
													Payment details
												</h2>
												<p className='student-subscription-payment__lead'>
													Enter your card information securely.
												</p>
											</div>
											<span className='student-subscription-payment__secure-tag'>
												<LockIcon />
												<span>SSL secure</span>
											</span>
										</div>

										<div
											className={`student-subscription-card student-subscription-card--${brand}`}
											aria-hidden='true'
										>
											<div className='student-subscription-card__shine' />
											<div className='student-subscription-card__row student-subscription-card__row--top'>
												<ChipIcon />
												<ContactlessIcon />
											</div>
											<div className='student-subscription-card__number'>
												{previewNumber.split('').map((char, idx) => (
													<span
														key={`${char}-${idx}`}
														className={
															char === '•'
																? 'student-subscription-card__digit student-subscription-card__digit--placeholder'
																: 'student-subscription-card__digit'
														}
													>
														{char === ' ' ? '\u00A0' : char}
													</span>
												))}
											</div>
											<div className='student-subscription-card__row student-subscription-card__row--bottom'>
												<div className='student-subscription-card__col'>
													<span className='student-subscription-card__label'>
														Card holder
													</span>
													<span className='student-subscription-card__value'>
														{previewName}
													</span>
												</div>
												<div className='student-subscription-card__col student-subscription-card__col--right'>
													<span className='student-subscription-card__label'>
														Expires
													</span>
													<span className='student-subscription-card__value'>
														{previewExpiry}
													</span>
												</div>
												<BrandLogo brand={brand} />
											</div>
										</div>

										<form
											className='student-subscription-payment__form'
											onSubmit={handleSubmit}
											noValidate
										>
											<div className='student-subscription-payment__field'>
												<label
													className='student-subscription-payment__label'
													htmlFor='subscription-name-on-card'
												>
													Name on card
												</label>
												<input
													type='text'
													id='subscription-name-on-card'
													name='nameOnCard'
													className='student-subscription-payment__input'
													placeholder='Full name'
													autoComplete='cc-name'
													value={nameOnCard}
													onChange={(e) =>
														setNameOnCard(e.target.value)}
												/>
											</div>

											<div className='student-subscription-payment__field'>
												<label
													className='student-subscription-payment__label'
													htmlFor='subscription-card-number'
												>
													Card number
												</label>
												<input
													type='text'
													id='subscription-card-number'
													name='cardNumber'
													className='student-subscription-payment__input'
													placeholder='1234 5678 9012 3456'
													autoComplete='cc-number'
													inputMode='numeric'
													value={cardNumber}
													onChange={handleCardNumberChange}
												/>
											</div>

											<div className='student-subscription-payment__row'>
												<div className='student-subscription-payment__field'>
													<label
														className='student-subscription-payment__label'
														htmlFor='subscription-expiry'
													>
														Expiry date
													</label>
													<input
														type='text'
														id='subscription-expiry'
														name='expiry'
														className='student-subscription-payment__input'
														placeholder='MM / YY'
														autoComplete='cc-exp'
														inputMode='numeric'
														value={expiry}
														onChange={handleExpiryChange}
													/>
												</div>
												<div className='student-subscription-payment__field'>
													<label
														className='student-subscription-payment__label'
														htmlFor='subscription-cvv'
													>
														CVV
													</label>
													<input
														type='password'
														id='subscription-cvv'
														name='cvv'
														className='student-subscription-payment__input'
														placeholder='•••'
														autoComplete='cc-csc'
														inputMode='numeric'
														value={cvv}
														onChange={handleCvvChange}
													/>
												</div>
											</div>

											<div className='student-subscription-payment__summary'>
												<div className='student-subscription-payment__summary-row'>
													<span>{planName}</span>
													<span>{planPriceFormatted}</span>
												</div>
												{totalQuestions != null && (
													<div className='student-subscription-payment__summary-row student-subscription-payment__summary-row--muted'>
														<span>
															{totalQuestions} questions / month
														</span>
														<span>
															{subjectTitles.length > 0
																? `${subjectTitles.length} subjects`
																: 'Auto-renew'}
														</span>
													</div>
												)}
												<div className='student-subscription-payment__summary-row student-subscription-payment__summary-row--muted'>
													<span>Billed every month</span>
													<span>Auto-renew</span>
												</div>
												<div className='student-subscription-payment__summary-divider' />
												<div className='student-subscription-payment__summary-total'>
													<span>Total today</span>
													<span>{planPriceFormatted}</span>
												</div>
											</div>

											{isAlreadySubscribed ? (
												<p className='student-subscription-payment__active-note'>
													You already have an active subscription
													for this plan.
												</p>
											) : null}

											<button
												type='submit'
												className='student-subscription-payment__submit'
												disabled={
													isSubscribing
													|| isAlreadySubscribed
												}
											>
												<span>
													{isSubscribing
														? 'Processing payment…'
														: isAlreadySubscribed
															? 'Already subscribed'
															: `Subscribe for ${planPriceFormatted}/mo`}
												</span>
												<ArrowIcon />
											</button>

											<p className='student-subscription-payment__secure'>
												<LockIcon />
												<span>
													Your payment is encrypted with 256-bit
													SSL. We never store your card details.
												</span>
											</p>
										</form>
									</div>
								</article>
							</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentSubscriptionScreen
