import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Plan from '../models/planModel.js';
import School from '../models/schoolModel.js';
import SchoolAdmin from '../models/schoolAdminModel.js';
import Student from '../models/studentModel.js';
import Subject from '../models/subjectModel.js';
import Subscription from '../models/subscriptionModel.js';
import {
    gradeLevelToJson,
    gradeLevelsToJson,
    normalizeSubjectGradesLevelField,
    resolveSubjectGradeLevels,
} from '../utils/gradeLevelHelpers.js';

const planSubjectPopulate = {
    path: 'subjects',
    select: 'title gradesLevel',
    populate: {
        path: 'gradesLevel',
        select: 'name',
    },
};

const planGradeLevelPopulate = {
    path: 'gradesLevel',
    select: 'name',
};

function planToJson (planDoc) {
    const plan = planDoc.toObject
        ? planDoc.toObject({ virtuals: false })
        : planDoc;
    const subs = plan.subjects || [];
    const subjectsOut = subs.map((s) => {
        if (s != null && typeof s === 'object' && s._id) {
            return {
                _id: s._id,
                title: s.title,
                gradesLevel: gradeLevelsToJson(
                    normalizeSubjectGradesLevelField(s.gradesLevel),
                ),
            };
        }
        return { _id: s };
    });
    const rawStudents = plan.students;
    const studentCount = Array.isArray(rawStudents) ? rawStudents.length : 0;

    return {
        _id: plan._id,
        price: plan.price,
        totalQuestions: plan.totalQuestions,
        active: plan.active,
        gradesLevel: gradeLevelToJson(plan.gradesLevel),
        subjects: subjectsOut,
        studentCount,
        school: plan.school,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
    };
}

async function assertSchoolAdminCanAccessSchool (
    res,
    schoolAdminId,
    schoolId,
) {
    const schoolAdmin = await SchoolAdmin.findById(schoolAdminId);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== String(schoolId)
    ) {
        res.status(403);
        throw new Error('Not authorized for this school');
    }

    const school = await School.findById(schoolId);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== String(schoolAdminId)) {
        res.status(403);
        throw new Error('Not authorized for this school');
    }

    return { schoolAdmin, school };
}

function parseSubjectIds (rawSubjects) {
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

async function validateSubjectsForSchool (res, uniqueIds, schoolIdStr) {
    if (uniqueIds.length === 0) {
        res.status(400);
        throw new Error('Select at least one subject for this plan');
    }

    for (const sid of uniqueIds) {
        if (!mongoose.Types.ObjectId.isValid(sid)) {
            res.status(400);
            throw new Error(`Invalid subject id: ${sid}`);
        }
        const subject = await Subject.findById(sid).select('school').lean();
        if (!subject) {
            res.status(400);
            throw new Error('One or more subjects were not found');
        }
        if (String(subject.school) !== schoolIdStr) {
            res.status(403);
            throw new Error(
                'All subjects must belong to your school',
            );
        }
    }
}

function parsePrice (res, price) {
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
        res.status(400);
        throw new Error('Valid price (>= 0) is required');
    }
    return priceNum;
}

function parseTotalQuestions (res, totalQuestions) {
    const totalQ = Number(totalQuestions);
    if (
        Number.isNaN(totalQ)
        || !Number.isFinite(totalQ)
        || totalQ < 1
        || Math.floor(totalQ) !== totalQ
    ) {
        res.status(400);
        throw new Error(
            'Total questions must be a positive whole number',
        );
    }
    return totalQ;
}

// GET /api/plans/school/:schoolId — school admin; must own the school
const getPlansBySchool = asyncHandler(async (req, res) => {
    const { schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    await assertSchoolAdminCanAccessSchool(
        res,
        req.schoolAdmin._id,
        schoolId,
    );

    const plans = await Plan.find({ school: schoolId })
        .populate(planSubjectPopulate)
        .populate(planGradeLevelPopulate)
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json(plans.map((p) => planToJson(p)));
});

// GET /api/plans/:id — school admin; must own the plan's school
const getPlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid plan id');
    }

    const plan = await Plan.findById(id)
        .populate(planSubjectPopulate)
        .populate(planGradeLevelPopulate)
        .lean();

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    await assertSchoolAdminCanAccessSchool(
        res,
        req.schoolAdmin._id,
        plan.school,
    );

    res.status(200).json(planToJson(plan));
});

// PUT /api/plans/:id — school admin; must own the plan's school
const updatePlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        price,
        totalQuestions,
        subjects: subjectIdsFromBody,
        active,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid plan id');
    }

    const plan = await Plan.findById(id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    await assertSchoolAdminCanAccessSchool(
        res,
        req.schoolAdmin._id,
        plan.school,
    );

    const schoolIdStr = String(plan.school);

    if (price !== undefined) {
        plan.price = parsePrice(res, price);
    }
    if (totalQuestions !== undefined) {
        plan.totalQuestions = parseTotalQuestions(res, totalQuestions);
    }
    if (active !== undefined && active !== null) {
        plan.active = Boolean(active);
    }
    if (subjectIdsFromBody !== undefined) {
        const uniqueIds = parseSubjectIds(subjectIdsFromBody);
        await validateSubjectsForSchool(res, uniqueIds, schoolIdStr);
        plan.subjects = uniqueIds;
    }

    const updated = await plan.save();
    const populated = await Plan.findById(updated._id)
        .populate(planSubjectPopulate)
        .populate(planGradeLevelPopulate)
        .exec();

    res.status(200).json(planToJson(populated));
});

// POST /api/plans — school admin; subjects must belong to the school
const createPlan = asyncHandler(async (req, res) => {
    const {
        price,
        totalQuestions,
        subjects: subjectIdsFromBody,
        active,
        school: schoolIdFromBody,
        gradesLevel: gradesLevelFromBody,
    } = req.body;

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id);

    if (!schoolAdmin) {
        res.status(404);
        throw new Error('School admin not found');
    }

    const rawSchoolId = schoolIdFromBody ?? schoolAdmin.school;
    if (!rawSchoolId) {
        res.status(400);
        throw new Error('School is required; link or register a school first');
    }

    const schoolIdStr =
        typeof rawSchoolId === 'object' && rawSchoolId._id
            ? String(rawSchoolId._id)
            : String(rawSchoolId);

    if (!mongoose.Types.ObjectId.isValid(schoolIdStr)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== schoolIdStr
    ) {
        res.status(403);
        throw new Error('Not authorized to create a plan for this school');
    }

    const school = await School.findById(schoolIdStr);

    if (!school) {
        res.status(404);
        throw new Error('School not found');
    }

    if (!school.admin || school.admin.toString() !== req.schoolAdmin._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to create a plan for this school');
    }

    const priceNum = parsePrice(res, price);
    const totalQ = parseTotalQuestions(res, totalQuestions);
    const uniqueIds = parseSubjectIds(subjectIdsFromBody);
    await validateSubjectsForSchool(res, uniqueIds, schoolIdStr);

    let gradesLevelId;
    if (
        gradesLevelFromBody !== undefined
        && gradesLevelFromBody !== null
        && String(gradesLevelFromBody).trim() !== ''
    ) {
        const resolved = await resolveSubjectGradeLevels(
            gradesLevelFromBody,
            school,
        );
        if (resolved.error) {
            res.status(400);
            throw new Error(resolved.error);
        }
        gradesLevelId = resolved.value[0];
    }

    const plan = await Plan.create({
        price: priceNum,
        totalQuestions: totalQ,
        active:
            active !== undefined && active !== null
                ? Boolean(active)
                : true,
        gradesLevel: gradesLevelId,
        subjects: uniqueIds,
        school: school._id,
    });

    await School.findByIdAndUpdate(school._id, {
        $push: { plans: plan._id },
    });

    const populated = await Plan.findById(plan._id)
        .populate(planSubjectPopulate)
        .populate(planGradeLevelPopulate)
        .exec();

    res.status(201).json(planToJson(populated));
});

function subscriptionSummaryJson (subDoc) {
    const sub = subDoc.toObject
        ? subDoc.toObject({ virtuals: false })
        : subDoc;

    return {
        _id: sub._id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        questionsAsked: sub.questionsAsked ?? 0,
        questionsLeft: sub.questionsLeft ?? 0,
        totalQuestions: sub.totalQuestions ?? 0,
        active: sub.active === true,
        renewal: sub.renewal === true,
        pastDue: sub.pastDue === true,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
    };
}

function planSubscriberJson (studentDoc, subscriptionDoc) {
    const student = studentDoc.toObject
        ? studentDoc.toObject({ virtuals: false })
        : studentDoc;

    return {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        signInDate: student.signInDate,
        createdAt: student.createdAt,
        gradesLevel: gradeLevelToJson(student.gradesLevel),
        subscription: subscriptionDoc
            ? subscriptionSummaryJson(subscriptionDoc)
            : null,
    };
}

// GET /api/plans/:id/subscriptions — school admin; subscribers for a plan
const getPlanSubscriptions = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid plan id');
    }

    const plan = await Plan.findById(id)
        .populate(planSubjectPopulate)
        .populate(planGradeLevelPopulate)
        .lean();

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    await assertSchoolAdminCanAccessSchool(
        res,
        req.schoolAdmin._id,
        plan.school,
    );

    const subscriptions = await Subscription.find({ plan: id })
        .sort({ createdAt: -1 })
        .lean();

    const subscriptionIds = subscriptions.map((s) => s._id);

    if (subscriptionIds.length === 0) {
        res.status(200).json({
            plan: planToJson(plan),
            students: [],
            summary: {
                totalStudents: 0,
                activeSubscriptions: 0,
                totalSubscriptions: 0,
            },
        });
        return;
    }

    const students = await Student.find({
        subscriptions: { $in: subscriptionIds },
    })
        .select(
            'firstname lastname email signInDate createdAt gradesLevel subscriptions',
        )
        .populate('gradesLevel', 'name')
        .sort({ lastname: 1, firstname: 1 })
        .lean();

    const subById = new Map(
        subscriptions.map((s) => [String(s._id), s]),
    );

    const studentsOut = students.map((student) => {
        const studentSubIds = (student.subscriptions ?? []).map(String);
        const planSubs = studentSubIds
            .map((sid) => subById.get(sid))
            .filter(Boolean)
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime()
                    - new Date(a.createdAt).getTime(),
            );
        const latestSub = planSubs[0] ?? null;

        return planSubscriberJson(student, latestSub);
    });

    const activeCount = subscriptions.filter(
        (s) => s.active === true,
    ).length;

    res.status(200).json({
        plan: planToJson(plan),
        students: studentsOut,
        summary: {
            totalStudents: studentsOut.length,
            activeSubscriptions: activeCount,
            totalSubscriptions: subscriptions.length,
        },
    });
});

export {
    createPlan,
    getPlansBySchool,
    getPlanById,
    updatePlanById,
    getPlanSubscriptions,
    planToJson,
};
