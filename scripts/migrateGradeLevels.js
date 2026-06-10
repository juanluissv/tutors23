import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import School from '../src/models/schoolModel.js';
import Subject from '../src/models/subjectModel.js';
import GradeLevel from '../src/models/gradeLevelModel.js';

dotenv.config();

async function ensureGradeLevelForSchool (schoolId, name) {
    const trimmed = String(name).trim();
    if (trimmed === '') {
        return null;
    }

    let gradeLevel = await GradeLevel.findOne({ school: schoolId, name: trimmed });
    if (!gradeLevel) {
        gradeLevel = await GradeLevel.create({
            name: trimmed,
            school: schoolId,
        });
    }

    return gradeLevel._id;
}

async function migrateSchoolGradeLevels () {
    const schools = await School.find({});
    let updatedSchools = 0;

    for (const school of schools) {
        const rawLevels = school.gradesLevels ?? [];
        if (rawLevels.length === 0) {
            continue;
        }

        const first = rawLevels[0];
        if (
            mongoose.Types.ObjectId.isValid(String(first))
            && String(first).length === 24
        ) {
            continue;
        }

        const nextIds = [];
        for (const level of rawLevels) {
            const id = await ensureGradeLevelForSchool(school._id, level);
            if (id) {
                nextIds.push(id);
            }
        }

        school.gradesLevels = nextIds;
        await school.save();
        updatedSchools += 1;
    }

    return updatedSchools;
}

async function migrateSubjectGradeLevels () {
    const subjects = await Subject.find({
        gradesLevel: { $exists: true, $ne: null },
    });
    let updatedSubjects = 0;

    for (const subject of subjects) {
        const current = subject.gradesLevel;

        if (Array.isArray(current)) {
            const hasLegacyStrings = current.some((item) => {
                const value = String(item);
                return !mongoose.Types.ObjectId.isValid(value)
                    || value.length !== 24;
            });
            if (!hasLegacyStrings) {
                continue;
            }
        } else if (
            mongoose.Types.ObjectId.isValid(String(current))
            && String(current).length === 24
        ) {
            const exists = await GradeLevel.findById(current);
            if (exists) {
                subject.gradesLevel = [current];
                await subject.save();
                updatedSubjects += 1;
                continue;
            }
        }

        const rawValues = Array.isArray(current) ? current : [current];
        const nextIds = [];

        for (const item of rawValues) {
            const value = String(item).trim();
            if (value === '') {
                continue;
            }

            if (
                mongoose.Types.ObjectId.isValid(value)
                && value.length === 24
            ) {
                const exists = await GradeLevel.findById(value);
                if (exists) {
                    nextIds.push(exists._id);
                    continue;
                }
            }

            const gradeLevelId = await ensureGradeLevelForSchool(
                subject.school,
                value,
            );
            if (gradeLevelId) {
                nextIds.push(gradeLevelId);
            }
        }

        subject.gradesLevel = nextIds;

        const school = await School.findById(subject.school);
        if (school) {
            const ids = (school.gradesLevels ?? []).map((id) => String(id));
            const merged = [...(school.gradesLevels ?? [])];
            for (const gradeLevelId of nextIds) {
                if (!ids.includes(String(gradeLevelId))) {
                    merged.push(gradeLevelId);
                }
            }
            school.gradesLevels = merged;
            await school.save();
        }

        await subject.save();
        updatedSubjects += 1;
    }

    return updatedSubjects;
}

async function runMigration () {
    await connectDB();

    const updatedSchools = await migrateSchoolGradeLevels();
    const updatedSubjects = await migrateSubjectGradeLevels();

    console.log(`Migrated ${updatedSchools} school(s)`);
    console.log(`Migrated ${updatedSubjects} subject(s)`);

    await mongoose.disconnect();
}

runMigration().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
