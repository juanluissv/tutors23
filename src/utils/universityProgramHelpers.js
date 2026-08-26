import mongoose from 'mongoose';
import UniversityProgram, {
	UNIVERSITY_PROGRAM_TYPES,
} from '../models/universityProgramModel.js';
import Subject from '../models/subjectModel.js';
import Plan from '../models/planModel.js';
import Student from '../models/studentModel.js';
import {
	formatCohortInUseError,
	isCohortInUse,
} from './schoolTypeHelpers.js';

function isValidProgramType (programType) {
	return UNIVERSITY_PROGRAM_TYPES.includes(String(programType).trim());
}

export function programToJson (program) {
	if (program == null) {
		return undefined;
	}
	if (typeof program === 'string') {
		const trimmed = program.trim();
		if (trimmed === '') {
			return undefined;
		}
		return { name: trimmed };
	}
	if (typeof program === 'object' && program.name != null) {
		const json = {
			_id: program._id,
			name: String(program.name).trim(),
		};
		if (program.department != null && String(program.department).trim() !== '') {
			json.department = String(program.department).trim();
		}
		if (
			program.programType != null
			&& String(program.programType).trim() !== ''
		) {
			json.programType = String(program.programType).trim();
		}
		return json;
	}
	return undefined;
}

export function programsToJson (programs) {
	if (!Array.isArray(programs)) {
		return [];
	}
	return programs
		.map((item) => programToJson(item))
		.filter(Boolean);
}

function parseProgramItems (programs) {
	if (!Array.isArray(programs)) {
		return { error: 'programs must be an array' };
	}

	const items = [];
	for (const entry of programs) {
		if (typeof entry === 'string') {
			const name = entry.trim();
			if (name !== '') {
				items.push({ name });
			}
			continue;
		}
		if (entry && typeof entry === 'object') {
			const name = String(entry.name ?? '').trim();
			if (name !== '') {
				const item = { name };
				if (
					entry.department != null
					&& String(entry.department).trim() !== ''
				) {
					item.department = String(entry.department).trim();
				}
				if (
					entry.programType != null
					&& String(entry.programType).trim() !== ''
				) {
					const programType = String(entry.programType).trim();
					if (!isValidProgramType(programType)) {
						return { error: 'Invalid program type' };
					}
					item.programType = programType;
				}
				items.push(item);
			}
		}
	}

	return { value: items };
}

async function getProgramUsage (programId) {
	const [subjects, plans, students] = await Promise.all([
		Subject.countDocuments({ program: programId }),
		Plan.countDocuments({ program: programId }),
		Student.countDocuments({ program: programId }),
	]);
	return { subjects, plans, students };
}

export async function deleteAllSchoolPrograms (schoolId) {
	await UniversityProgram.deleteMany({ school: schoolId });
}

export async function syncSchoolPrograms (school, programs) {
	const parsed = parseProgramItems(programs);
	if (parsed.error) {
		return parsed;
	}

	const nextNames = parsed.value.map((item) => item.name);
	const existing = await UniversityProgram.find({ school: school._id });
	const toDrop = existing.filter(
		(program) => !nextNames.includes(program.name),
	);

	for (const program of toDrop) {
		const usage = await getProgramUsage(program._id);
		if (isCohortInUse(usage)) {
			return {
				error: formatCohortInUseError(
					program.name,
					usage,
					'program',
				),
			};
		}
	}

	const ids = [];
	for (const item of parsed.value) {
		let program = await UniversityProgram.findOne({
			school: school._id,
			name: item.name,
		});
		if (!program) {
			program = await UniversityProgram.create({
				name: item.name,
				department: item.department,
				programType: item.programType,
				school: school._id,
			});
		} else {
			if (item.department !== undefined) {
				program.department = item.department;
			}
			if (item.programType !== undefined) {
				program.programType = item.programType;
			}
			await program.save();
		}
		ids.push(program._id);
	}

	if (toDrop.length > 0) {
		await UniversityProgram.deleteMany({
			_id: { $in: toDrop.map((program) => program._id) },
		});
	}

	school.programs = ids;
	return { value: ids };
}

export function normalizeSubjectProgramField (program) {
	if (program == null) {
		return [];
	}
	if (Array.isArray(program)) {
		return program;
	}
	return [program];
}

async function resolveSubjectProgramId (program, school) {
	if (
		program === undefined
		|| program === null
		|| String(program).trim() === ''
	) {
		return { value: undefined };
	}

	const input = String(program).trim();
	const schoolId = school._id ?? school;

	if (mongoose.Types.ObjectId.isValid(input)) {
		const programDoc = await UniversityProgram.findOne({
			_id: input,
			school: schoolId,
		});
		if (!programDoc) {
			return {
				error: 'Program must be one of your institution programs',
			};
		}
		return { value: programDoc._id };
	}

	const schoolPrograms = await UniversityProgram.find({ school: schoolId });
	if (schoolPrograms.length > 0) {
		const match = schoolPrograms.find((item) => item.name === input);
		if (!match) {
			return {
				error: 'Program must be one of your institution programs',
			};
		}
		return { value: match._id };
	}

	const created = await UniversityProgram.create({
		name: input,
		school: schoolId,
	});
	school.programs = [...(school.programs ?? []), created._id];
	await school.save();

	return { value: created._id };
}

export async function resolveSubjectPrograms (program, school) {
	if (program === undefined || program === null) {
		return { value: [] };
	}

	const items = Array.isArray(program) ? program : [program];
	const ids = [];
	const seen = new Set();

	for (const item of items) {
		if (item === null || item === undefined || String(item).trim() === '') {
			continue;
		}

		const resolved = await resolveSubjectProgramId(item, school);
		if (resolved.error) {
			return resolved;
		}
		if (resolved.value) {
			const idStr = String(resolved.value);
			if (!seen.has(idStr)) {
				seen.add(idStr);
				ids.push(resolved.value);
			}
		}
	}

	return { value: ids };
}

export function requireSubjectPrograms (programIds) {
	if (!Array.isArray(programIds) || programIds.length === 0) {
		return {
			error: 'Select at least one program for this subject',
		};
	}
	return { value: programIds };
}
