export function isSuperAdmin (schoolAdmin) {
	return schoolAdmin?.role === 'superadmin'
}

export function canSchoolAdminAccessSchool (schoolAdmin, school) {
	if (!schoolAdmin || !school) {
		return false
	}

	if (isSuperAdmin(schoolAdmin)) {
		return true
	}

	const schoolAdminId = String(schoolAdmin._id)

	if (!school.admin || school.admin.toString() !== schoolAdminId) {
		return false
	}

	if (
		schoolAdmin.school
		&& String(schoolAdmin.school) !== String(school._id)
	) {
		return false
	}

	return true
}

export function denyIfSchoolAdminCannotAccessSchool (
	res,
	schoolAdmin,
	school,
	message = 'Not authorized for this school',
) {
	if (!canSchoolAdminAccessSchool(schoolAdmin, school)) {
		res.status(403)
		throw new Error(message)
	}
}
