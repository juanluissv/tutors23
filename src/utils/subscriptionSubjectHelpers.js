import mongoose from 'mongoose';
import Subject from '../models/subjectModel.js';
import Student from '../models/studentModel.js';

export function isUniversityStudentChoicePlan (plan) {
    if (!plan?.program) {
        return false;
    }
    const subjects = plan.subjects ?? [];
    return subjects.length === 0;
}

export function parseMaxSubjects (raw, fallback = 5) {
    if (raw === undefined || raw === null || String(raw).trim() === '') {
        return fallback;
    }
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 1) {
        return null;
    }
    return num;
}

export function parseSubjectIdList (rawSubjects) {
    const raw = Array.isArray(rawSubjects) ? rawSubjects : [];
    return [
        ...new Set(
            raw.map((id) =>
                typeof id === 'object' && id !== null && id._id
                    ? String(id._id)
                    : String(id),
            ).filter((s) => s !== 'undefined' && s !== 'null'),
        ),
    ];
}

export function subjectBelongsToProgram (subjectDoc, programId) {
    const programIds = (subjectDoc.program ?? []).map((id) => String(id));
    return programIds.includes(String(programId));
}

export async function linkStudentToSubjects (
    studentId,
    subjectIds,
    normalizedEmail,
) {
    const uniqueIds = [
        ...new Set(
            (subjectIds ?? [])
                .map((id) => String(id))
                .filter((id) => mongoose.Types.ObjectId.isValid(id)),
        ),
    ];

    if (uniqueIds.length === 0) {
        return;
    }

    const subjectUpdate = {
        $addToSet: { students: studentId },
    };
    if (normalizedEmail) {
        subjectUpdate.$addToSet.studentsEmail = normalizedEmail;
    }

    await Subject.updateMany(
        { _id: { $in: uniqueIds } },
        subjectUpdate,
    );

    await Student.updateOne(
        { _id: studentId },
        { $addToSet: { subjects: { $each: uniqueIds } } },
    );
}

export async function unlinkStudentFromSubjects (
    studentId,
    subjectIds,
    normalizedEmail,
) {
    const uniqueIds = [
        ...new Set(
            (subjectIds ?? [])
                .map((id) => String(id))
                .filter((id) => mongoose.Types.ObjectId.isValid(id)),
        ),
    ];

    if (uniqueIds.length === 0) {
        return;
    }

    const subjectPull = {
        students: studentId,
    };
    if (normalizedEmail) {
        subjectPull.studentsEmail = normalizedEmail;
    }

    await Subject.updateMany(
        { _id: { $in: uniqueIds } },
        { $pull: subjectPull },
    );

    await Student.updateOne(
        { _id: studentId },
        { $pull: { subjects: { $in: uniqueIds } } },
    );
}

export async function validateSelectedSubjectsForPlan (
    res,
    subjectIds,
    plan,
    schoolIdStr,
) {
    const maxSubjects = parseMaxSubjects(plan.maxSubjects, 5);
    const programId = plan.program?._id ?? plan.program;

    if (!programId) {
        res.status(400);
        throw new Error('This plan does not support subject selection');
    }

    if (subjectIds.length === 0) {
        res.status(400);
        throw new Error('Select at least one subject');
    }

    if (subjectIds.length > maxSubjects) {
        res.status(400);
        throw new Error(`You can select up to ${maxSubjects} subjects`);
    }

    for (const sid of subjectIds) {
        if (!mongoose.Types.ObjectId.isValid(sid)) {
            res.status(400);
            throw new Error(`Invalid subject id: ${sid}`);
        }

        const subject = await Subject.findById(sid)
            .select('school program title')
            .lean();

        if (!subject) {
            res.status(404);
            throw new Error('One or more subjects were not found');
        }

        if (String(subject.school) !== schoolIdStr) {
            res.status(403);
            throw new Error('All subjects must belong to your school');
        }

        if (!subjectBelongsToProgram(subject, programId)) {
            res.status(400);
            throw new Error(
                'All subjects must belong to your plan program',
            );
        }
    }
}
