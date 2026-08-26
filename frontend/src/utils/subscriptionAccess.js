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

export function subscriptionNeedsSubjectSelection (subscription) {
	return subscription?.needsSubjectSelection === true
}

export function getSelectSubjectsPath (subscription) {
	const id = subscription?._id
	if (!id) {
		return null
	}
	return `/students/select-subjects/${id}`
}

export function canViewQuestions (subscription) {
	return (
		subscription?.active === true
		&& subscription?.pastDue !== true
		&& subscriptionNeedsSubjectSelection(subscription) !== true
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
		return 'Necesitas una suscripción activa para acceder a las preguntas.'
	}
	if (subscription.pastDue) {
		return 'Tu suscripción está vencida. Renuévala para continuar.'
	}
	if (!subscription.active) {
		return 'Tu suscripción está inactiva. Suscríbete para continuar.'
	}
	if (subscriptionNeedsSubjectSelection(subscription)) {
		return (
			'Elige tus materias de este semestre para empezar a aprender.'
		)
	}
	if (
		action === 'ask'
		&& (Number(subscription.questionsLeft) || 0) <= 0
	) {
		return 'No te quedan preguntas en este período de facturación.'
	}
	return null
}

export function getSubscriptionNoticeTitle (subscription) {
	if (subscriptionNeedsSubjectSelection(subscription)) {
		return 'Elige tus materias'
	}
	return 'Se requiere una suscripción'
}

export function getSubscriptionNoticeAction (subscription) {
	const to = getSelectSubjectsPath(subscription)
	if (subscriptionNeedsSubjectSelection(subscription) && to) {
		return {
			to,
			label: 'Elige tus materias',
		}
	}
	return {
		to: '/students/subscription',
		label: 'Ver planes y suscribirte',
	}
}

export function getStudentSubjectsEmptyMessage (subscription) {
	if (subscriptionNeedsSubjectSelection(subscription)) {
		return (
			'Elige tus materias de este semestre. Aparecerán aquí '
			+ 'después de guardar tu selección.'
		)
	}
	if (
		subscription?.active === true
		&& subscription?.pastDue !== true
	) {
		return (
			'Aún no estás inscrito en ninguna materia. Si te acabas '
			+ 'de suscribir, elige tus materias, o pide a tu '
			+ 'administrador escolar que te agregue a un plan.'
		)
	}
	return (
		'Aún no estás inscrito en ninguna materia. Suscríbete a un '
		+ 'plan para obtener acceso, o pide a tu administrador '
		+ 'escolar que te agregue.'
	)
}
