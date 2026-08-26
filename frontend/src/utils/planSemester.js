export const MIN_PLAN_SEMESTERS = 1
export const MAX_PLAN_SEMESTERS = 4

export function createEmptySemesterRow () {
	return {
		startDate: '',
		endDate: '',
	}
}

export function toDateInputValue (value) {
	if (!value) {
		return ''
	}
	const d = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(d.getTime())) {
		return ''
	}
	const y = d.getUTCFullYear()
	const m = String(d.getUTCMonth() + 1).padStart(2, '0')
	const day = String(d.getUTCDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

export function semestersFromPlan (plan) {
	const list = Array.isArray(plan?.semesters) ? plan.semesters : []
	if (list.length === 0) {
		return [createEmptySemesterRow()]
	}
	return list.map((row) => ({
		startDate: toDateInputValue(row?.startDate),
		endDate: toDateInputValue(row?.endDate),
	}))
}

export function resizeSemesterRows (rows, nextCount) {
	const raw = Number(nextCount)
	const count = Number.isInteger(raw)
		? Math.min(MAX_PLAN_SEMESTERS, Math.max(MIN_PLAN_SEMESTERS, raw))
		: MIN_PLAN_SEMESTERS
	const current = Array.isArray(rows) ? rows : []
	const next = current.slice(0, count).map((row) => ({
		startDate: row?.startDate ?? '',
		endDate: row?.endDate ?? '',
	}))
	while (next.length < count) {
		next.push(createEmptySemesterRow())
	}
	return next
}

export function validateSemesterForm (semesters) {
	const list = Array.isArray(semesters) ? semesters : []
	if (
		list.length < MIN_PLAN_SEMESTERS
		|| list.length > MAX_PLAN_SEMESTERS
	) {
		return `Plans can have between ${MIN_PLAN_SEMESTERS} and ${MAX_PLAN_SEMESTERS} semesters`
	}

	for (let i = 0; i < list.length; i += 1) {
		const row = list[i] ?? {}
		const label = `Semester ${i + 1}`
		const start = String(row.startDate ?? '').trim()
		const end = String(row.endDate ?? '').trim()

		if (start === '') {
			return `${label} start date is required`
		}
		if (end === '') {
			return `${label} end date is required`
		}

		const startDate = new Date(`${start}T00:00:00.000Z`)
		const endDate = new Date(`${end}T00:00:00.000Z`)
		if (
			Number.isNaN(startDate.getTime())
			|| Number.isNaN(endDate.getTime())
		) {
			return `${label} has an invalid date`
		}
		if (endDate.getTime() <= startDate.getTime()) {
			return `${label} end date must be after its start date`
		}

		if (i > 0) {
			const prevEnd = String(list[i - 1]?.endDate ?? '').trim()
			const prevEndDate = new Date(`${prevEnd}T00:00:00.000Z`)
			if (startDate.getTime() <= prevEndDate.getTime()) {
				return `${label} must start after semester ${i} ends`
			}
		}
	}

	return null
}

export function formatSemesterRange (semesters) {
	const list = Array.isArray(semesters) ? semesters : []
	if (list.length === 0) {
		return ''
	}
	const countLabel = `${list.length} semester${list.length === 1 ? '' : 's'}`
	return countLabel
}
