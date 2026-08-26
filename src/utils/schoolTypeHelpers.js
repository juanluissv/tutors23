export function isUniversitySchool (schoolType) {
	return schoolType === 'university';
}

function formatCountLabel (count, singular, plural) {
	if (!count || count < 1) {
		return null;
	}
	return `${count} ${count === 1 ? singular : plural}`;
}

function joinUsageLabels (parts) {
	if (parts.length === 0) {
		return '';
	}
	if (parts.length === 1) {
		return parts[0];
	}
	if (parts.length === 2) {
		return `${parts[0]} and ${parts[1]}`;
	}
	return `${parts.slice(0, -1).join(', ')}, and ${
		parts[parts.length - 1]
	}`;
}

export function isCohortInUse (usage) {
	return (
		(usage?.subjects ?? 0) > 0
		|| (usage?.plans ?? 0) > 0
		|| (usage?.students ?? 0) > 0
	);
}

export function formatCohortInUseError (name, usage, noun) {
	const parts = [
		formatCountLabel(usage.subjects, 'subject', 'subjects'),
		formatCountLabel(usage.plans, 'plan', 'plans'),
		formatCountLabel(usage.students, 'student', 'students'),
	].filter(Boolean);
	return (
		`Cannot remove ${name}: `
		+ `${joinUsageLabels(parts)} still use this ${noun}`
	);
}
