export function normalizeGradeLevel (gradeLevel) {
	if (gradeLevel == null) {
		return null
	}
	if (typeof gradeLevel === 'string') {
		const trimmed = gradeLevel.trim()
		if (trimmed === '') {
			return null
		}
		return { _id: trimmed, name: trimmed }
	}
	if (typeof gradeLevel === 'object' && gradeLevel.name != null) {
		const name = String(gradeLevel.name).trim()
		if (name === '') {
			return null
		}
		return {
			_id: gradeLevel._id != null
				? String(gradeLevel._id)
				: name,
			name,
		}
	}
	return null
}

export function normalizeGradeLevels (gradesLevels) {
	if (!Array.isArray(gradesLevels)) {
		return []
	}
	return gradesLevels
		.map((level) => normalizeGradeLevel(level))
		.filter(Boolean)
}

export function normalizeSubjectGradeLevels (gradesLevel) {
	if (gradesLevel == null) {
		return []
	}
	if (Array.isArray(gradesLevel)) {
		return normalizeGradeLevels(gradesLevel)
	}
	const single = normalizeGradeLevel(gradesLevel)
	return single ? [single] : []
}

export function getGradeLevelName (gradeLevel) {
	return normalizeGradeLevel(gradeLevel)?.name ?? ''
}

export function getGradeLevelId (gradeLevel) {
	return normalizeGradeLevel(gradeLevel)?._id ?? ''
}

export function getGradeLevelLabel (gradeLevel, fallback = 'Grade —') {
	const name = getGradeLevelName(gradeLevel)
	if (name === '') {
		return fallback
	}
	return `Grade ${name}`
}

export function getSubjectGradeLevelsLabel (
	gradesLevel,
	fallback = 'Grade —',
) {
	const levels = normalizeSubjectGradeLevels(gradesLevel)
	if (levels.length === 0) {
		return fallback
	}
	if (levels.length === 1) {
		return `Grade ${levels[0].name}`
	}
	return `Grades ${levels.map((level) => level.name).join(', ')}`
}

export function getSubjectGradeLevelNames (gradesLevel) {
	return normalizeSubjectGradeLevels(gradesLevel)
		.map((level) => level.name)
		.join(', ')
}

export function gradeLevelNamesFromApi (gradesLevels) {
	return normalizeGradeLevels(gradesLevels).map((level) => level.name)
}

export function gradeLevelsMatch (left, right) {
	const leftLevel = normalizeGradeLevel(left)
	const rightLevel = normalizeGradeLevel(right)
	if (!leftLevel || !rightLevel) {
		return false
	}
	if (leftLevel._id && rightLevel._id) {
		return leftLevel._id === rightLevel._id
	}
	return leftLevel.name === rightLevel.name
}

export function subjectIncludesGradeLevel (subjectGradesLevel, selectedGradeLevel) {
	return normalizeSubjectGradeLevels(subjectGradesLevel).some(
		(level) => gradeLevelsMatch(level, selectedGradeLevel),
	)
}

export function subjectGradeLabel (subject) {
	const levels = normalizeSubjectGradeLevels(subject?.gradesLevel)
	if (levels.length === 0) {
		return 'All grades'
	}
	if (levels.length === 1) {
		return `Grade ${levels[0].name}`
	}
	return `Grades ${levels.map((level) => level.name).join(', ')}`
}
