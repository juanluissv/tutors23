import mongoose from 'mongoose';
import GradeLevel from '../models/gradeLevelModel.js';

export function gradeLevelToJson (gradeLevel) {
    if (gradeLevel == null) {
        return undefined;
    }
    if (typeof gradeLevel === 'string') {
        const trimmed = gradeLevel.trim();
        if (trimmed === '') {
            return undefined;
        }
        return { name: trimmed };
    }
    if (typeof gradeLevel === 'object' && gradeLevel.name != null) {
        return {
            _id: gradeLevel._id,
            name: String(gradeLevel.name).trim(),
        };
    }
    return undefined;
}

export function gradeLevelsToJson (gradeLevels) {
    if (!Array.isArray(gradeLevels)) {
        return [];
    }
    return gradeLevels
        .map((level) => gradeLevelToJson(level))
        .filter(Boolean);
}

function parseGradeLevelNames (gradesLevels) {
    if (!Array.isArray(gradesLevels)) {
        return { error: 'gradesLevels must be an array' };
    }

    const names = [];
    for (const item of gradesLevels) {
        if (typeof item === 'string') {
            const name = item.trim();
            if (name !== '') {
                names.push(name);
            }
            continue;
        }
        if (item && typeof item === 'object') {
            const name = String(item.name ?? '').trim();
            if (name !== '') {
                names.push(name);
            }
        }
    }

    return { value: names };
}

export async function createGradeLevelsForSchool (schoolId, gradesLevels) {
    const parsed = parseGradeLevelNames(gradesLevels);
    if (parsed.error) {
        return parsed;
    }

    const ids = [];
    for (const name of parsed.value) {
        let gradeLevel = await GradeLevel.findOne({ school: schoolId, name });
        if (!gradeLevel) {
            gradeLevel = await GradeLevel.create({ name, school: schoolId });
        }
        ids.push(gradeLevel._id);
    }

    return { value: ids };
}

export async function syncSchoolGradeLevels (school, gradesLevels) {
    const parsed = parseGradeLevelNames(gradesLevels);
    if (parsed.error) {
        return parsed;
    }

    const ids = [];
    for (const name of parsed.value) {
        let gradeLevel = await GradeLevel.findOne({
            school: school._id,
            name,
        });
        if (!gradeLevel) {
            gradeLevel = await GradeLevel.create({
                name,
                school: school._id,
            });
        }
        ids.push(gradeLevel._id);
    }

    school.gradesLevels = ids;
    return { value: ids };
}

export function normalizeSubjectGradesLevelField (gradesLevel) {
    if (gradesLevel == null) {
        return [];
    }
    if (Array.isArray(gradesLevel)) {
        return gradesLevel;
    }
    return [gradesLevel];
}

async function resolveSubjectGradeLevelId (gradesLevel, school) {
    if (
        gradesLevel === undefined
        || gradesLevel === null
        || String(gradesLevel).trim() === ''
    ) {
        return { value: undefined };
    }

    const input = String(gradesLevel).trim();
    const schoolId = school._id ?? school;

    if (mongoose.Types.ObjectId.isValid(input)) {
        const gradeLevelDoc = await GradeLevel.findOne({
            _id: input,
            school: schoolId,
        });
        if (!gradeLevelDoc) {
            return { error: 'Grade level must be one of your school grade levels' };
        }
        return { value: gradeLevelDoc._id };
    }

    const schoolGradeLevels = await GradeLevel.find({ school: schoolId });
    if (schoolGradeLevels.length > 0) {
        const match = schoolGradeLevels.find((level) => level.name === input);
        if (!match) {
            return { error: 'Grade level must be one of your school grade levels' };
        }
        return { value: match._id };
    }

    const created = await GradeLevel.create({
        name: input,
        school: schoolId,
    });
    school.gradesLevels = [...(school.gradesLevels ?? []), created._id];
    await school.save();

    return { value: created._id };
}

export async function resolveSubjectGradeLevels (gradesLevel, school) {
    if (gradesLevel === undefined || gradesLevel === null) {
        return { value: [] };
    }

    const items = Array.isArray(gradesLevel) ? gradesLevel : [gradesLevel];
    const ids = [];
    const seen = new Set();

    for (const item of items) {
        if (item === null || item === undefined || String(item).trim() === '') {
            continue;
        }

        const resolved = await resolveSubjectGradeLevelId(item, school);
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
