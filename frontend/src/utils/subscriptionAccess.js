export function resolveCurrentSubscription (subscriptions) {
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

export function canViewQuestions (subscription) {
	return (
		subscription?.active === true
		&& subscription?.pastDue !== true
	)
}

export function canAskNewQuestion (subscription) {
	if (!canViewQuestions(subscription)) {
		return false
	}
	return (Number(subscription?.questionsLeft) || 0) > 0
}

export function getSubscriptionBlockReason (subscription, action = 'view') {
	if (!subscription) {
		return 'You need an active subscription to access questions.'
	}
	if (subscription.pastDue) {
		return 'Your subscription is past due. Please renew to continue.'
	}
	if (!subscription.active) {
		return 'Your subscription is inactive. Subscribe to continue.'
	}
	if (
		action === 'ask'
		&& (Number(subscription.questionsLeft) || 0) <= 0
	) {
		return 'You have no questions remaining this billing period.'
	}
	return null
}
