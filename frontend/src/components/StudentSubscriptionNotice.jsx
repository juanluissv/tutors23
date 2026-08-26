import { Link } from 'react-router-dom'
import {
	getSubscriptionBlockReason,
	getSubscriptionNoticeAction,
	getSubscriptionNoticeTitle,
} from '../utils/subscriptionAccess'

function StudentSubscriptionNotice ({
	subscription,
	action = 'view',
	title,
	className = '',
	extraText,
	children,
}) {
	const reason = getSubscriptionBlockReason(subscription, action)
	const cta = getSubscriptionNoticeAction(subscription)
	const heading = title || getSubscriptionNoticeTitle(subscription)
	const noticeClass = className
		? `ask-subscription-notice ${className}`
		: 'ask-subscription-notice'

	return (
		<div className={noticeClass}>
			<p className='ask-subscription-notice__title'>
				{heading}
			</p>
			<p className='ask-subscription-notice__text'>
				{reason}
				{extraText ? ` ${extraText}` : ''}
			</p>
			<Link
				to={cta.to}
				className='ask-subscription-notice__link'
			>
				{cta.label}
			</Link>
			{children}
		</div>
	)
}

export default StudentSubscriptionNotice
