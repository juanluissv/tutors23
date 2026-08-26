export function parseOrder (value) {
	const n = parseInt(String(value ?? ''), 10)
	return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n
}

export function lessonKey (lesson) {
	return `${String(lesson.sectionNumber ?? '')}:${String(
		lesson.lessonNumber ?? '',
	)}`
}

export function buildSectionGroups (course, labels = {}) {
	const sectionPrefix = labels.section ?? 'Section'
	const otherLessons = labels.otherLessons ?? 'Other lessons'
	const sections = Array.isArray(course?.sections)
		? [...course.sections]
		: []
	const sortedSections = [...sections].sort((a, b) =>
		parseOrder(a.sectionNumber) - parseOrder(b.sectionNumber),
	)
	const lessonPool = Array.isArray(course?.lessons)
		? [...course.lessons]
		: []
	const claimed = new Set()

	const rows = sortedSections.map((sec) => {
		const secNum = String(sec.sectionNumber ?? '')
		const lessonsHere = lessonPool
			.filter((l) => String(l.sectionNumber ?? '') === secNum)
			.sort((a, b) =>
				parseOrder(a.lessonNumber) - parseOrder(b.lessonNumber),
			)
		lessonsHere.forEach((l) => {
			claimed.add(lessonKey(l))
		})
		const label = sec.sectionTitle
			? `${sectionPrefix} ${secNum}: ${sec.sectionTitle}`
			: `${sectionPrefix} ${secNum}`
		return {
			sectionNumber: secNum,
			label,
			lessons: lessonsHere,
		}
	})

	const orphanLessons = lessonPool
		.filter((l) => !claimed.has(lessonKey(l)))
		.sort((a, b) =>
			parseOrder(a.sectionNumber) - parseOrder(b.sectionNumber)
			|| parseOrder(a.lessonNumber) - parseOrder(b.lessonNumber),
		)

	if (orphanLessons.length > 0) {
		rows.push({
			sectionNumber: '__orphans',
			label: otherLessons,
			lessons: orphanLessons,
		})
	}

	return rows
}
