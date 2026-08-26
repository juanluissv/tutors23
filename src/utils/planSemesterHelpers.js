export const MIN_PLAN_SEMESTERS = 1
export const MAX_PLAN_SEMESTERS = 4

function startOfDayUtc (date) {
	const d = date instanceof Date ? new Date(date) : new Date(date)
	if (Number.isNaN(d.getTime())) {
		return null
	}
	return new Date(Date.UTC(
		d.getUTCFullYear(),
		d.getUTCMonth(),
		d.getUTCDate(),
		0,
		0,
		0,
		0,
	))
}

function parseYearMonthDay (raw) {
	if (raw === undefined || raw === null || String(raw).trim() === '') {
		return null
	}
	if (raw instanceof Date) {
		if (Number.isNaN(raw.getTime())) {
			return null
		}
		return {
			y: raw.getUTCFullYear(),
			m: raw.getUTCMonth() + 1,
			d: raw.getUTCDate(),
		}
	}
	const str = String(raw).trim()
	const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
	if (ymd) {
		const y = Number(ymd[1])
		const m = Number(ymd[2])
		const d = Number(ymd[3])
		if (
			!Number.isInteger(y)
			|| !Number.isInteger(m)
			|| !Number.isInteger(d)
			|| m < 1
			|| m > 12
			|| d < 1
			|| d > 31
		) {
			return null
		}
		return { y, m, d }
	}
	const parsed = new Date(str)
	if (Number.isNaN(parsed.getTime())) {
		return null
	}
	return {
		y: parsed.getUTCFullYear(),
		m: parsed.getUTCMonth() + 1,
		d: parsed.getUTCDate(),
	}
}

function toStartUtc ({ y, m, d }) {
	return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

function toEndUtc ({ y, m, d }) {
	return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999))
}

export function normalizeSemesterList (semesters) {
	if (!Array.isArray(semesters)) {
		return []
	}
	return semesters
		.map((row) => {
			if (!row || typeof row !== 'object') {
				return null
			}
			const start = row.startDate
				? new Date(row.startDate)
				: null
			const end = row.endDate ? new Date(row.endDate) : null
			if (
				!start
				|| !end
				|| Number.isNaN(start.getTime())
				|| Number.isNaN(end.getTime())
			) {
				return null
			}
			return { startDate: start, endDate: end }
		})
		.filter(Boolean)
}

export function semestersToJson (semesters) {
	return normalizeSemesterList(semesters).map((row, index) => ({
		index,
		startDate: row.startDate,
		endDate: row.endDate,
	}))
}

export function copySemestersSnapshot (semesters) {
	return normalizeSemesterList(semesters).map((row) => ({
		startDate: row.startDate,
		endDate: row.endDate,
	}))
}

export function isSemesterEnded (semester, now = new Date()) {
	if (!semester?.endDate) {
		return false
	}
	const today = startOfDayUtc(now)
	const end = startOfDayUtc(semester.endDate)
	if (!today || !end) {
		return false
	}
	return today.getTime() > end.getTime()
}

export function hasSemesterStarted (semester, now = new Date()) {
	if (!semester?.startDate) {
		return true
	}
	const today = startOfDayUtc(now)
	const start = startOfDayUtc(semester.startDate)
	if (!today || !start) {
		return true
	}
	return today.getTime() >= start.getTime()
}

export function isDateInSemester (semester, now = new Date()) {
	if (!semester?.startDate || !semester?.endDate) {
		return false
	}
	const today = startOfDayUtc(now)
	const start = startOfDayUtc(semester.startDate)
	const end = startOfDayUtc(semester.endDate)
	if (!today || !start || !end) {
		return false
	}
	return (
		today.getTime() >= start.getTime()
		&& today.getTime() <= end.getTime()
	)
}

export function resolveSemesterIndex (
	semesters,
	now = new Date(),
	currentIndex = 0,
) {
	const list = normalizeSemesterList(semesters)
	if (list.length === 0) {
		return 0
	}

	const containing = list.findIndex((row) => isDateInSemester(row, now))
	if (containing >= 0) {
		return containing
	}

	if (!hasSemesterStarted(list[0], now)) {
		return 0
	}

	const last = list.length - 1
	if (isSemesterEnded(list[last], now)) {
		return last
	}

	let endedIndex = Math.max(0, Number(currentIndex) || 0)
	if (endedIndex > last) {
		endedIndex = last
	}
	for (let i = 0; i < list.length; i += 1) {
		if (isSemesterEnded(list[i], now)) {
			endedIndex = i
		}
	}
	return endedIndex
}

export function currentSemesterWindow (semesters, index = 0) {
	const list = normalizeSemesterList(semesters)
	if (list.length === 0) {
		return null
	}
	const safeIndex = Math.min(
		Math.max(0, Number(index) || 0),
		list.length - 1,
	)
	return list[safeIndex] ?? null
}

export function parsePlanSemesters (res, rawSemesters) {
	if (rawSemesters === undefined || rawSemesters === null) {
		res.status(400)
		throw new Error(
			'Add at least one semester with a start date and end date',
		)
	}

	if (!Array.isArray(rawSemesters)) {
		res.status(400)
		throw new Error('Semesters must be a list')
	}

	if (
		rawSemesters.length < MIN_PLAN_SEMESTERS
		|| rawSemesters.length > MAX_PLAN_SEMESTERS
	) {
		res.status(400)
		throw new Error(
			`Plans can have between ${MIN_PLAN_SEMESTERS} and ${MAX_PLAN_SEMESTERS} semesters`,
		)
	}

	const parsed = []

	for (let i = 0; i < rawSemesters.length; i += 1) {
		const row = rawSemesters[i] ?? {}
		const label = `Semester ${i + 1}`
		const startParts = parseYearMonthDay(row.startDate)
		const endParts = parseYearMonthDay(row.endDate)

		if (!startParts) {
			res.status(400)
			throw new Error(`${label} start date is required`)
		}
		if (!endParts) {
			res.status(400)
			throw new Error(`${label} end date is required`)
		}

		const startDate = toStartUtc(startParts)
		const endDate = toEndUtc(endParts)

		if (endDate.getTime() <= startDate.getTime()) {
			res.status(400)
			throw new Error(
				`${label} end date must be after its start date`,
			)
		}

		if (parsed.length > 0) {
			const previousEnd = parsed[parsed.length - 1].endDate
			if (startDate.getTime() <= previousEnd.getTime()) {
				res.status(400)
				throw new Error(
					`${label} must start after semester ${i} ends`,
				)
			}
		}

		parsed.push({ startDate, endDate })
	}

	return parsed
}
