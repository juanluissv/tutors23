import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetSchoolEarningsQuery } from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

const PERIOD_OPTIONS = [
	{ value: 12, label: 'Past 12 months' },
	{ value: 6, label: 'Past 6 months' },
	{ value: 3, label: 'Past 3 months' },
]

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

function formatCurrency (value, { compact = false } = {}) {
	const n = Number(value)
	if (Number.isNaN(n)) {
		return '$0.00'
	}
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: compact && n >= 100 ? 0 : 2,
			maximumFractionDigits: compact && n >= 100 ? 0 : 2,
		}).format(n)
	} catch {
		return `$${n.toFixed(2)}`
	}
}

function formatShortDate (value) {
	if (!value) {
		return '—'
	}
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) {
		return '—'
	}
	const now = new Date()
	const sameYear = d.getFullYear() === now.getFullYear()
	return d.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: sameYear ? undefined : 'numeric',
	})
}

function formatPayoutDate (value) {
	if (!value) {
		return '—'
	}
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) {
		return '—'
	}
	return d.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	})
}

function statusTone (status) {
	if (status === 'Succeeded') {
		return 'success'
	}
	if (status === 'Past due') {
		return 'warning'
	}
	return 'muted'
}

function SchoolAdminEarningsScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [months, setMonths] = useState(12)

	const {
		data,
		isLoading,
		isError,
		refetch,
	} = useGetSchoolEarningsQuery(
		{ schoolId, months },
		{ skip: !schoolId },
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const periodLabel = PERIOD_OPTIONS.find(
		(opt) => opt.value === months,
	)?.label ?? `Past ${months} months`

	const summary = data?.summary ?? {
		lifetimeEarnings: 0,
		totalEarnings: 0,
		totalBalance: 0,
		availableToPayout: 0,
		totalPayments: 0,
		periodEarnings: 0,
		nextPayoutDate: null,
	}

	const lifetimeEarnings =
		summary.lifetimeEarnings ?? summary.totalEarnings ?? 0

	const monthlyEarnings = useMemo(
		() => (Array.isArray(data?.monthlyEarnings)
			? data.monthlyEarnings
			: []),
		[data?.monthlyEarnings],
	)

	const transactions = useMemo(
		() => (Array.isArray(data?.transactions) ? data.transactions : []),
		[data?.transactions],
	)

	const activity = useMemo(
		() => (Array.isArray(data?.activity) ? data.activity : []),
		[data?.activity],
	)

	const chartMax = useMemo(() => {
		const peak = monthlyEarnings.reduce(
			(max, item) => Math.max(max, Number(item.earnings) || 0),
			0,
		)
		if (peak <= 0) {
			return 80
		}
		const step = peak <= 40 ? 20 : peak <= 120 ? 40 : 80
		return Math.ceil(peak / step) * step
	}, [monthlyEarnings])

	const yTicks = useMemo(() => {
		const steps = 4
		const tickStep = chartMax / steps
		return Array.from({ length: steps + 1 }, (_, i) =>
			Math.round(tickStep * (steps - i)),
		)
	}, [chartMax])

	if (!schoolAdminInfo) {
		return null
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
						<div className='school-earnings-page'>
							{!schoolId && (
								<div className='school-earnings-page__empty'>
									<p>
										Link a school to your account to view subscription
										earnings.
									</p>
								</div>
							)}

							{schoolId && isLoading && (
								<p className='school-earnings-page__loading'>
									Loading earnings…
								</p>
							)}

							{schoolId && isError && !isLoading && (
								<div className='school-earnings-page__empty'>
									<p>We couldn&apos;t load your earnings right now.</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Try again
									</button>
								</div>
							)}

							{schoolId && !isLoading && !isError && (
								<div className='school-earnings-page__layout'>
									<div className='school-earnings-page__main'>
										<section
											className='school-earnings-card school-earnings-chart'
											aria-label='Recent earnings'
										>
											<div className='school-earnings-card__head'>
												<div className='school-earnings-card__title-wrap'>
													<h1 className='school-earnings-card__title'>
														Recent earnings
													</h1>
													<span
														className='school-earnings-card__info'
														title={
															'50% revenue share from student ' +
															'subscription payments'
														}
														aria-label={
															'50% revenue share from student ' +
															'subscription payments'
														}
													>
														i
													</span>
												</div>
												<label className='school-earnings-period'>
													<span className='visually-hidden'>
														Earnings period
													</span>
													<select
														className='school-earnings-period__select'
														value={months}
														onChange={(e) =>
															setMonths(Number(e.target.value))
														}
													>
														{PERIOD_OPTIONS.map((opt) => (
															<option
																key={opt.value}
																value={opt.value}
															>
																{opt.label}
															</option>
														))}
													</select>
												</label>
											</div>

											<p className='school-earnings-chart__total'>
												{formatCurrency(summary.periodEarnings)}
											</p>
											<p className='school-earnings-chart__subtitle'>
												{periodLabel} · 50% revenue share
											</p>

											<div
												className='school-earnings-chart__wrap'
												role='img'
												aria-label='Monthly earnings bar chart'
											>
												<div className='school-earnings-chart__y-axis'>
													{yTicks.map((tick) => (
														<span key={tick}>
															{formatCurrency(tick, {
																compact: true,
															})}
														</span>
													))}
												</div>
												<div className='school-earnings-chart__plot'>
													<div className='school-earnings-chart__grid'>
														{yTicks.slice(0, -1).map((tick) => (
															<span
																key={`grid-${tick}`}
																className='school-earnings-chart__grid-line'
															/>
														))}
													</div>
													<div className='school-earnings-chart__bars'>
														{monthlyEarnings.map((item) => {
															const amount =
																Number(item.earnings) || 0
															const heightPct = chartMax > 0
																? (amount / chartMax) * 100
																: 0
															return (
																<div
																	key={item.key}
																	className='school-earnings-chart__bar-col'
																>
																	<div
																		className='school-earnings-chart__bar'
																		style={{
																			height: `${Math.max(
																				heightPct,
																				amount > 0 ? 4 : 0,
																			)}%`,
																		}}
																		title={
																			`${item.label}: ` +
																			formatCurrency(amount)
																		}
																	/>
																	<span className='school-earnings-chart__bar-label'>
																		{item.label}
																	</span>
																</div>
															)
														})}
													</div>
												</div>
											</div>
										</section>

										<section
											className='school-earnings-card school-earnings-transactions'
											aria-label='Recent transactions'
										>
											<div className='school-earnings-card__head'>
												<h2 className='school-earnings-card__title'>
													Recent transactions
												</h2>
												<span className='school-earnings-card__meta'>
													{summary.totalPayments}{' '}
													{summary.totalPayments === 1
														? 'payment'
														: 'payments'}
												</span>
											</div>

											{transactions.length === 0 && (
												<div className='school-earnings-transactions__empty'>
													<p>
														No subscription payments yet. Earnings
														appear here when students subscribe to
														your school plans.
													</p>
												</div>
											)}

											{transactions.length > 0 && (
												<div className='school-earnings-table-wrap'>
													<table className='school-earnings-table'>
														<thead>
															<tr>
																<th scope='col'>Date</th>
																<th scope='col'>Status</th>
																<th scope='col'>Type</th>
																<th scope='col'>Amount</th>
																<th scope='col'>Net</th>
															</tr>
														</thead>
														<tbody>
															{transactions.map((tx) => (
																<tr key={String(tx._id)}>
																	<td>
																		{formatShortDate(tx.date)}
																	</td>
																	<td>
																		<span
																			className={
																				'school-earnings-badge ' +
																				`school-earnings-badge--${statusTone(tx.status)}`
																			}
																		>
																			{tx.status}
																		</span>
																	</td>
																	<td>{tx.type}</td>
																	<td>
																		{formatCurrency(
																			tx.grossAmount,
																		)}
																	</td>
																	<td className='school-earnings-table__net'>
																		{formatCurrency(
																			tx.netAmount,
																		)}{' '}
																		USD
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											)}
										</section>
									</div>

									<aside
										className='school-earnings-page__aside'
										aria-label='Balance and activity'
									>
										<section className='school-earnings-card school-earnings-balance'>
											<h2 className='school-earnings-card__title'>
												Total balance
											</h2>
											<p className='school-earnings-balance__amount'>
												{formatCurrency(lifetimeEarnings)}
											</p>
											<p className='school-earnings-balance__subtitle'>
												All-time earnings
											</p>
											<dl className='school-earnings-balance__rows'>
												<div className='school-earnings-balance__row'>
													<dt>Available to pay out</dt>
													<dd>
														{formatCurrency(
															summary.availableToPayout,
														)}
													</dd>
												</div>
												<div className='school-earnings-balance__row'>
													<dt>Next payout scheduled for</dt>
													<dd>
														{formatPayoutDate(
															summary.nextPayoutDate,
														)}
													</dd>
												</div>
												<div className='school-earnings-balance__row'>
													<dt>Revenue share</dt>
													<dd>50%</dd>
												</div>
											</dl>
											<button
												type='button'
												className='school-earnings-balance__btn'
												disabled
												title='Payout details coming soon'
											>
												See details
											</button>
										</section>

										<section className='school-earnings-card school-earnings-activity'>
											<div className='school-earnings-card__head'>
												<h2 className='school-earnings-card__title'>
													Activity
												</h2>
											</div>

											{activity.length === 0 && (
												<div className='school-earnings-activity__empty'>
													<span
														className='school-earnings-activity__icon'
														aria-hidden
													>
														<svg
															width='28'
															height='28'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='1.5'
														>
															<path d='M9 11l3 3L22 4' />
															<path d='M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' />
														</svg>
													</span>
													<p>No activity</p>
												</div>
											)}

											{activity.length > 0 && (
												<ul className='school-earnings-activity__list'>
													{activity.map((item) => (
														<li
															key={String(item._id)}
															className='school-earnings-activity__item'
														>
															<span className='school-earnings-activity__dot' />
															<div>
																<p className='school-earnings-activity__text'>
																	{item.message}
																</p>
																<time
																	className='school-earnings-activity__time'
																	dateTime={item.date}
																>
																	{formatShortDate(item.date)}
																</time>
															</div>
														</li>
													))}
												</ul>
											)}
										</section>
									</aside>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminEarningsScreen
