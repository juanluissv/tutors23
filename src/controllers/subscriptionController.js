import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Student from '../models/studentModel.js';
import Plan from '../models/planModel.js';
import School from '../models/schoolModel.js';
import Subject from '../models/subjectModel.js';
import Subscription from '../models/subscriptionModel.js';
import { planToJson } from './planController.js';
import { subjectToJson } from './subjectController.js';
import { REVENUE_SHARE } from '../utils/revenueShare.js';
import {
    isUniversityStudentChoicePlan,
    linkStudentToSubjects,
    unlinkStudentFromSubjects,
    parseSubjectIdList,
    validateSelectedSubjectsForPlan,
} from '../utils/subscriptionSubjectHelpers.js';
import {
    copySemestersSnapshot,
    currentSemesterWindow,
    isDateInSemester,
    isSemesterEnded,
    normalizeSemesterList,
    resolveSemesterIndex,
    semestersToJson,
} from '../utils/planSemesterHelpers.js';

const subscriptionPlanPopulate = {
    path: 'plan',
    select: 'price totalQuestions active gradesLevel program maxSubjects subjects school semesters',
    populate: [
        {
            path: 'gradesLevel',
            select: 'name',
        },
        {
            path: 'program',
            select: 'name department programType',
        },
        {
            path: 'subjects',
            select: 'title gradesLevel program semester',
            populate: [
                {
                    path: 'gradesLevel',
                    select: 'name',
                },
                {
                    path: 'program',
                    select: 'name department programType',
                },
            ],
        },
    ],
};

const subscriptionSelectedSubjectsPopulate = {
    path: 'selectedSubjects',
    select: 'title program semester',
    populate: {
        path: 'program',
        select: 'name department programType',
    },
};

const studentSubscriptionsPopulate = {
    path: 'subscriptions',
    populate: [
        subscriptionPlanPopulate,
        subscriptionSelectedSubjectsPopulate,
    ],
};

function addOneMonth (date) {
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    return end;
}

function isPastDate (date, now = new Date()) {
    if (!date) {
        return false;
    }
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) {
        return false;
    }
    return now.getTime() > d.getTime();
}

function startOfDay (date) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function computeDaysUntilRenewal (endDate, now = new Date()) {
    if (!endDate) {
        return null;
    }
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    if (Number.isNaN(end.getTime())) {
        return null;
    }
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.round(
        (startOfDay(end).getTime() - startOfDay(now).getTime()) / msPerDay,
    );
    return Math.max(0, diff);
}

function currentSemesterAllowsRenewal (sub, now = new Date()) {
    const list = normalizeSemesterList(sub.semesters);
    if (list.length === 0) {
        return true;
    }
    const index = resolveSemesterIndex(
        list,
        now,
        sub.currentSemesterIndex,
    );
    const window = currentSemesterWindow(list, index);
    if (!window) {
        return true;
    }
    return !isSemesterEnded(window, now);
}

function upsertSemesterSelection (
    sub,
    semesterIndex,
    subjectIds,
    selectedAt,
) {
    const list = sub.semesterSelections ?? [];
    const existing = list.find(
        (row) => Number(row.semesterIndex) === Number(semesterIndex),
    );
    const ids = [...(subjectIds ?? [])];
    if (existing) {
        existing.selectedSubjects = ids;
        existing.subjectsSelectedAt = selectedAt;
    } else {
        list.push({
            semesterIndex,
            selectedSubjects: ids,
            subjectsSelectedAt: selectedAt,
        });
        sub.semesterSelections = list;
    }
    if (typeof sub.markModified === 'function') {
        sub.markModified('semesterSelections');
    }
}

function applySemesterProgression (sub, now = new Date()) {
    const list = normalizeSemesterList(sub.semesters);
    if (list.length === 0) {
        return { changed: false, unlinkSubjectIds: [] };
    }

    const fromIndex = Math.max(0, Number(sub.currentSemesterIndex) || 0);
    const toIndex = resolveSemesterIndex(list, now, fromIndex);
    const window = currentSemesterWindow(list, toIndex);
    const endOfSemesterDate = window?.endDate ?? null;
    const currentEnded = window
        ? isSemesterEnded(window, now)
        : false;
    const unlinkSubjectIds = [];
    let changed = false;

    if (toIndex > fromIndex) {
        const oldSubjects = [...(sub.selectedSubjects ?? [])];
        if (oldSubjects.length > 0) {
            upsertSemesterSelection(
                sub,
                fromIndex,
                oldSubjects,
                sub.subjectsSelectedAt ?? now,
            );
            unlinkSubjectIds.push(...oldSubjects);
        }
        sub.selectedSubjects = [];
        sub.subjectsSelectedAt = null;
        sub.currentSemesterIndex = toIndex;
        sub.endOfSemesterDate = endOfSemesterDate;
        sub.renewal = !currentEnded;
        if (window && isDateInSemester(window, now)) {
            sub.startDate = now;
            sub.endDate = addOneMonth(now);
            sub.questionsAsked = 0;
            const total = Math.max(0, Number(sub.totalQuestions) || 0);
            sub.questionsLeft = total;
            sub.pastDue = false;
            sub.active = true;
        }
        changed = true;
    } else {
        if ((sub.currentSemesterIndex ?? 0) !== toIndex) {
            sub.currentSemesterIndex = toIndex;
            changed = true;
        }
        const prevEnd = sub.endOfSemesterDate
            ? new Date(sub.endOfSemesterDate).getTime()
            : null;
        const nextEnd = endOfSemesterDate
            ? new Date(endOfSemesterDate).getTime()
            : null;
        if (prevEnd !== nextEnd) {
            sub.endOfSemesterDate = endOfSemesterDate;
            changed = true;
        }
        if (sub.renewal === true && currentEnded) {
            sub.renewal = false;
            changed = true;
        }
    }

    return { changed, unlinkSubjectIds };
}

function computeSubscriptionStatus (sub, now = new Date()) {
    const totalQuestions = Math.max(0, Number(sub.totalQuestions) || 0);
    const questionsAsked = Math.max(0, Number(sub.questionsAsked) || 0);
    const questionsLeft = Math.max(0, totalQuestions - questionsAsked);
    const expired = isPastDate(sub.endDate, now);
    const willRenew =
        sub.renewal === true
        && currentSemesterAllowsRenewal(sub, now);

    let active;
    let pastDue;

    if (expired) {
        if (willRenew) {
            pastDue = true;
            active = false;
        } else {
            pastDue = false;
            active = false;
        }
    } else {
        pastDue = false;
        active = true;
    }

    return { questionsLeft, active, pastDue };
}

function selectedSubjectsToJson (selectedSubjects) {
    const raw = selectedSubjects ?? [];
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.map((subject) => {
        if (subject != null && typeof subject === 'object' && subject._id) {
            return subjectToJson(subject);
        }
        return { _id: subject };
    });
}

function subscriptionNeedsSubjectSelection (
    sub,
    planOut,
    now = new Date(),
) {
    if (!planOut || !isUniversityStudentChoicePlan(planOut)) {
        return false;
    }
    const selected = sub.selectedSubjects ?? [];
    if (Array.isArray(selected) && selected.length > 0) {
        return false;
    }
    const list = normalizeSemesterList(sub.semesters);
    if (list.length === 0) {
        return true;
    }
    const index = Number(sub.currentSemesterIndex) || 0;
    const window = currentSemesterWindow(list, index);
    if (!window) {
        return true;
    }
    if (isSemesterEnded(window, now)) {
        return false;
    }
    return true;
}

async function refreshStudentSubscriptions (studentId) {
    const student = await Student.findById(studentId)
        .select('subscriptions email')
        .lean();

    if (!student?.subscriptions?.length) {
        return;
    }

    const subs = await Subscription.find({
        _id: { $in: student.subscriptions },
    });
    const now = new Date();
    const emailNorm = student.email
        ? String(student.email).trim().toLowerCase()
        : '';

    for (const sub of subs) {
        const progression = applySemesterProgression(sub, now);
        const next = computeSubscriptionStatus(sub, now);
        const needsUpdate =
            progression.changed
            || (sub.questionsLeft ?? 0) !== next.questionsLeft
            || sub.active !== next.active
            || sub.pastDue !== next.pastDue;

        if (progression.unlinkSubjectIds.length > 0) {
            await unlinkStudentFromSubjects(
                studentId,
                progression.unlinkSubjectIds,
                emailNorm,
            );
        }

        if (needsUpdate) {
            sub.questionsLeft = next.questionsLeft;
            sub.active = next.active;
            sub.pastDue = next.pastDue;
            await sub.save();
        }
    }
}

async function getStudentActiveSubscription (studentId) {
    await refreshStudentSubscriptions(studentId);

    const student = await Student.findById(studentId)
        .select('subscriptions')
        .lean();

    if (!student?.subscriptions?.length) {
        return null;
    }

    const sub = await Subscription.findOne({
        _id: { $in: student.subscriptions },
        active: true,
        pastDue: { $ne: true },
    })
        .sort({ createdAt: -1 })
        .populate({
            path: 'plan',
            select: 'program subjects maxSubjects',
        });

    return sub ?? null;
}

function universitySubscriptionNeedsSubjects (sub) {
    if (!sub) {
        return false;
    }
    if (!isUniversityStudentChoicePlan(sub.plan)) {
        return false;
    }
    const selected = sub.selectedSubjects ?? [];
    return selected.length === 0;
}

function subscriptionToJson (doc) {
    const sub = doc.toObject
        ? doc.toObject({ virtuals: false })
        : doc;
    const planOut =
        sub.plan != null && typeof sub.plan === 'object' && sub.plan._id
            ? planToJson(sub.plan)
            : sub.plan
                ? { _id: sub.plan }
                : null;
    const selectedOut = selectedSubjectsToJson(sub.selectedSubjects);

    return {
        _id: sub._id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        endOfSemesterDate: sub.endOfSemesterDate ?? null,
        daysUntilRenewal: computeDaysUntilRenewal(sub.endDate),
        questionsAsked: sub.questionsAsked ?? 0,
        questionsLeft: sub.questionsLeft ?? 0,
        totalQuestions: sub.totalQuestions ?? 0,
        active: sub.active === true,
        renewal: sub.renewal === true,
        pastDue: sub.pastDue === true,
        amountPaid: sub.amountPaid ?? null,
        revenueShare: REVENUE_SHARE,
        plan: planOut,
        selectedSubjects: selectedOut,
        subjectsSelectedAt: sub.subjectsSelectedAt ?? null,
        semesters: semestersToJson(sub.semesters),
        currentSemesterIndex: sub.currentSemesterIndex ?? 0,
        needsSubjectSelection: subscriptionNeedsSubjectSelection(
            sub,
            planOut,
        ),
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
    };
}

async function studentHasActivePlanSubscription (studentId, planId) {
    const student = await Student.findById(studentId)
        .select('subscriptions')
        .lean();

    if (!student?.subscriptions?.length) {
        return false;
    }

    const active = await Subscription.findOne({
        _id: { $in: student.subscriptions },
        plan: planId,
        active: true,
    }).select('_id').lean();

    return Boolean(active);
}

async function populateSubscription (subscriptionId) {
    return Subscription.findById(subscriptionId)
        .populate(subscriptionPlanPopulate)
        .populate(subscriptionSelectedSubjectsPopulate)
        .exec();
}

// POST /api/students/subscribe — simulated payment (simulation must be true)
const subscribeStudent = asyncHandler(async (req, res) => {
    const { planId, simulation } = req.body;
    const studentId = req.student._id;

    if (simulation !== true) {
        res.status(400);
        throw new Error(
            'Real payment processing is not enabled yet. Use simulation mode.',
        );
    }

    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400);
        throw new Error('Valid plan id is required');
    }

    const student = await Student.findById(studentId)
        .select('plans subscriptions school email');

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const assignedPlanIds = (student.plans ?? []).map((id) => String(id));
    if (!assignedPlanIds.includes(String(planId))) {
        res.status(403);
        throw new Error('This plan is not assigned to your account');
    }

    const plan = await Plan.findById(planId)
        .select(
            'totalQuestions active school price program subjects maxSubjects semesters',
        );

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    if (plan.active === false) {
        res.status(400);
        throw new Error('This plan is no longer available');
    }

    const alreadyActive = await studentHasActivePlanSubscription(
        studentId,
        planId,
    );
    if (alreadyActive) {
        res.status(400);
        throw new Error(
            'You already have an active subscription for this plan',
        );
    }

    const startDate = new Date();
    const endDate = addOneMonth(startDate);
    const totalQuestions = Number(plan.totalQuestions) || 0;
    const amountPaid = Math.round((Number(plan.price) || 0) * 100) / 100;
    const semesterSnapshot = copySemestersSnapshot(plan.semesters);
    const currentSemesterIndex = resolveSemesterIndex(
        semesterSnapshot,
        startDate,
    );
    const currentWindow = currentSemesterWindow(
        semesterSnapshot,
        currentSemesterIndex,
    );
    const endOfSemesterDate = currentWindow?.endDate ?? null;
    const renewal = currentWindow
        ? !isSemesterEnded(currentWindow, startDate)
        : true;

    const subscriptionPayload = {
        startDate,
        endDate,
        endOfSemesterDate,
        semesters: semesterSnapshot,
        currentSemesterIndex,
        questionsAsked: 0,
        questionsLeft: totalQuestions,
        totalQuestions,
        active: true,
        renewal,
        pastDue: false,
        plan: plan._id,
        amountPaid,
        selectedSubjects: [],
        semesterSelections: [],
    };

    const subscription = await Subscription.create(subscriptionPayload);

    await Student.findByIdAndUpdate(studentId, {
        $addToSet: { subscriptions: subscription._id },
    });

    await Plan.findByIdAndUpdate(planId, {
        $addToSet: { students: studentId },
    });

    const schoolId = plan.school ?? student.school ?? null;
    if (schoolId) {
        await School.findByIdAndUpdate(schoolId, {
            $addToSet: { subscriptions: subscription._id },
        });
    }

    const populated = await populateSubscription(subscription._id);

    const allSubs = await Subscription.find({
        _id: {
            $in: [
                ...(student.subscriptions ?? []),
                subscription._id,
            ],
        },
    })
        .populate(subscriptionPlanPopulate)
        .populate(subscriptionSelectedSubjectsPopulate)
        .sort({ createdAt: -1 })
        .exec();

    const subscriptionJson = subscriptionToJson(populated);

    res.status(201).json({
        message: 'Subscription activated (simulated payment)',
        subscription: subscriptionJson,
        subscriptions: allSubs.map((s) => subscriptionToJson(s)),
        needsSubjectSelection: subscriptionJson.needsSubjectSelection,
    });
});

// GET /api/students/subscriptions/:subscriptionId/available-subjects
const getAvailableSubscriptionSubjects = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;
    const studentId = req.student._id;

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
        res.status(400);
        throw new Error('Invalid subscription id');
    }

    const student = await Student.findById(studentId)
        .select('subscriptions school')
        .lean();

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const ownsSub = (student.subscriptions ?? []).some(
        (id) => String(id) === String(subscriptionId),
    );
    if (!ownsSub) {
        res.status(403);
        throw new Error('Not authorized for this subscription');
    }

    await refreshStudentSubscriptions(studentId);

    const subscription = await Subscription.findById(subscriptionId)
        .populate(subscriptionPlanPopulate)
        .exec();

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    const plan = subscription.plan;
    if (!plan || !isUniversityStudentChoicePlan(plan)) {
        res.status(400);
        throw new Error('This subscription does not require subject selection');
    }

    const programId = plan.program?._id ?? plan.program;
    const schoolId = plan.school ?? student.school;

    if (!programId || !schoolId) {
        res.status(400);
        throw new Error('Plan program or school is missing');
    }

    const subjects = await Subject.find({
        school: schoolId,
        program: programId,
    })
        .sort({ semester: 1, title: 1, createdAt: -1 })
        .lean();

    res.status(200).json({
        subscriptionId: subscription._id,
        maxSubjects: plan.maxSubjects ?? 5,
        program: plan.program,
        currentSemesterIndex: subscription.currentSemesterIndex ?? 0,
        endOfSemesterDate: subscription.endOfSemesterDate ?? null,
        subjects: subjects.map((subject) => subjectToJson(subject)),
    });
});

// PUT /api/students/subscriptions/:subscriptionId/subjects
const selectSubscriptionSubjects = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;
    const { subjectIds: subjectIdsFromBody } = req.body;
    const studentId = req.student._id;

    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
        res.status(400);
        throw new Error('Invalid subscription id');
    }

    const student = await Student.findById(studentId)
        .select('subscriptions school email')
        .lean();

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const ownsSub = (student.subscriptions ?? []).some(
        (id) => String(id) === String(subscriptionId),
    );
    if (!ownsSub) {
        res.status(403);
        throw new Error('Not authorized for this subscription');
    }

    await refreshStudentSubscriptions(studentId);

    const subscription = await Subscription.findById(subscriptionId)
        .populate(subscriptionPlanPopulate)
        .exec();

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    if (subscription.active !== true) {
        res.status(400);
        throw new Error(
            'Subject selection is only available for active subscriptions',
        );
    }

    const existingSelected = subscription.selectedSubjects ?? [];
    if (existingSelected.length > 0) {
        res.status(400);
        throw new Error(
            'Subjects were already selected for this semester and cannot be changed until the next semester starts',
        );
    }

    const currentWindow = currentSemesterWindow(
        subscription.semesters,
        subscription.currentSemesterIndex,
    );
    if (currentWindow && isSemesterEnded(currentWindow, new Date())) {
        res.status(400);
        throw new Error(
            'Subject selection opens when the next semester starts',
        );
    }

    const plan = subscription.plan;
    if (!plan || !isUniversityStudentChoicePlan(plan)) {
        res.status(400);
        throw new Error('This subscription does not require subject selection');
    }

    const uniqueIds = parseSubjectIdList(subjectIdsFromBody);
    const schoolIdStr = String(plan.school ?? student.school ?? '');

    await validateSelectedSubjectsForPlan(
        res,
        uniqueIds,
        plan,
        schoolIdStr,
    );

    const selectedAt = new Date();
    subscription.selectedSubjects = uniqueIds;
    subscription.subjectsSelectedAt = selectedAt;
    upsertSemesterSelection(
        subscription,
        subscription.currentSemesterIndex ?? 0,
        uniqueIds,
        selectedAt,
    );
    await subscription.save();

    const emailNorm = student.email
        ? String(student.email).trim().toLowerCase()
        : '';
    await linkStudentToSubjects(studentId, uniqueIds, emailNorm);

    const populated = await populateSubscription(subscription._id);

    res.status(200).json({
        message: 'Subjects selected successfully',
        subscription: subscriptionToJson(populated),
    });
});

export {
    subscribeStudent,
    getAvailableSubscriptionSubjects,
    selectSubscriptionSubjects,
    subscriptionToJson,
    subscriptionPlanPopulate,
    studentSubscriptionsPopulate,
    refreshStudentSubscriptions,
    getStudentActiveSubscription,
    universitySubscriptionNeedsSubjects,
};
