import { subjectGradeLabel } from './gradeLevel'

export const UNIVERSITY_PROGRAM_TYPES = [
	'tecnico',
	'licenciatura',
	'ingenieria',
	'maestria',
	'doctorado',
	'diplomado',
]

const PROGRAM_TYPE_LABELS = {
	tecnico: 'Técnico',
	licenciatura: 'Licenciatura',
	ingenieria: 'Ingeniería',
	maestria: 'Maestría',
	doctorado: 'Doctorado',
	diplomado: 'Diplomado',
}

export function getProgramTypeLabel (programType) {
	if (programType == null || String(programType).trim() === '') {
		return ''
	}
	const key = String(programType).trim()
	return PROGRAM_TYPE_LABELS[key] ?? key
}

export function normalizeUniversityProgram (program) {
	if (program == null) {
		return null
	}
	if (typeof program === 'string') {
		const trimmed = program.trim()
		if (trimmed === '') {
			return null
		}
		return { _id: trimmed, name: trimmed }
	}
	if (typeof program === 'object' && program.name != null) {
		const name = String(program.name).trim()
		if (name === '') {
			return null
		}
		const normalized = {
			_id: program._id != null
				? String(program._id)
				: name,
			name,
		}
		if (
			program.department != null
			&& String(program.department).trim() !== ''
		) {
			normalized.department = String(program.department).trim()
		}
		if (
			program.programType != null
			&& String(program.programType).trim() !== ''
		) {
			normalized.programType = String(program.programType).trim()
		}
		return normalized
	}
	return null
}

export function normalizeUniversityPrograms (programs) {
	if (!Array.isArray(programs)) {
		return []
	}
	return programs
		.map((item) => normalizeUniversityProgram(item))
		.filter(Boolean)
}

export function normalizeSubjectPrograms (program) {
	if (program == null) {
		return []
	}
	if (Array.isArray(program)) {
		return normalizeUniversityPrograms(program)
	}
	const single = normalizeUniversityProgram(program)
	return single ? [single] : []
}

export function getProgramName (program) {
	return normalizeUniversityProgram(program)?.name ?? ''
}

export function getProgramId (program) {
	return normalizeUniversityProgram(program)?._id ?? ''
}

export function programsForApi (programs) {
	return normalizeUniversityPrograms(programs).map((item) => {
		const payload = { name: item.name }
		if (item.department) {
			payload.department = item.department
		}
		if (item.programType) {
			payload.programType = item.programType
		}
		return payload
	})
}

export function programsMatch (left, right) {
	const leftProgram = normalizeUniversityProgram(left)
	const rightProgram = normalizeUniversityProgram(right)
	if (!leftProgram || !rightProgram) {
		return false
	}
	if (leftProgram._id && rightProgram._id) {
		return leftProgram._id === rightProgram._id
	}
	return leftProgram.name === rightProgram.name
}

export function subjectIncludesProgram (subjectProgram, selectedProgram) {
	return normalizeSubjectPrograms(subjectProgram).some(
		(item) => programsMatch(item, selectedProgram),
	)
}

export function getSubjectProgramsLabel (
	program,
	fallback = 'Program —',
) {
	const programs = normalizeSubjectPrograms(program)
	if (programs.length === 0) {
		return fallback
	}
	if (programs.length === 1) {
		return programs[0].name
	}
	return programs.map((item) => item.name).join(', ')
}

export function getSubjectCohortLabel (subject, options = {}) {
	const {
		isUniversity = false,
		emptyProgramFallback = 'Program —',
	} = options
	const programs = normalizeSubjectPrograms(subject?.program)
	const hasPrograms = programs.length > 0
	const semesterValue = subject?.semester
	const hasSemester = semesterValue != null
		&& String(semesterValue).trim() !== ''
	const useProgram = isUniversity === true
		|| hasPrograms
		|| hasSemester

	if (useProgram) {
		const programLabel = getSubjectProgramsLabel(
			subject?.program,
			emptyProgramFallback,
		)
		if (hasSemester) {
			return `${programLabel} · Semester ${semesterValue}`
		}
		return programLabel
	}

	return subjectGradeLabel(subject)
}

export function planMatchesProgram (plan, programId) {
	if (!programId || !plan) {
		return false
	}
	const programRef = plan.program
	if (!programRef) {
		return true
	}
	const planProgramId =
		typeof programRef === 'object' && programRef._id != null
			? String(programRef._id)
			: String(programRef)
	return planProgramId === String(programId)
}
