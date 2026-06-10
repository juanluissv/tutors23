import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Student from '../models/studentModel.js';
import Plan from '../models/planModel.js';
import School from '../models/schoolModel.js';
import Subscription from '../models/subscriptionModel.js';
import { planToJson } from './planController.js';
import { REVENUE_SHARE } from '../utils/revenueShare.js';

const subscriptionPlanPopulate = {
    path: 'plan',
    select: 'price totalQuestions active gradesLevel subjects school',
    populate: {
        path: 'gradesLevel',
        select: 'name',
    },
};

const studentSubscriptionsPopulate = {
    path: 'subscriptions',
    populate: subscriptionPlanPopulate,
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

function computeSubscriptionStatus (sub, now = new Date()) {
    const totalQuestions = Math.max(0, Number(sub.totalQuestions) || 0);
    const questionsAsked = Math.max(0, Number(sub.questionsAsked) || 0);
    const questionsLeft = Math.max(0, totalQuestions - questionsAsked);
    const expired = isPastDate(sub.endDate, now);

    let active;
    let pastDue;

    if (expired) {
        if (sub.renewal === true) {
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

async function refreshStudentSubscriptions (studentId) {
    const student = await Student.findById(studentId)
        .select('subscriptions')
        .lean();

    if (!student?.subscriptions?.length) {
        return;
    }

    const subs = await Subscription.find({
        _id: { $in: student.subscriptions },
    });
    const now = new Date();

    for (const sub of subs) {
        const next = computeSubscriptionStatus(sub, now);
        const needsUpdate =
            (sub.questionsLeft ?? 0) !== next.questionsLeft
            || sub.active !== next.active
            || sub.pastDue !== next.pastDue;

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
        .sort({ createdAt: -1 });

    return sub ?? null;
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

    return {
        _id: sub._id,
        startDate: sub.startDate,
        endDate: sub.endDate,
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
        .select('plans subscriptions school');

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
        .select('totalQuestions active school price');

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

    const subscription = await Subscription.create({
        startDate,
        endDate,
        questionsAsked: 0,
        questionsLeft: totalQuestions,
        totalQuestions,
        active: true,
        renewal: true,
        pastDue: false,
        plan: plan._id,
        amountPaid,
    });

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

    const populated = await Subscription.findById(subscription._id)
        .populate(subscriptionPlanPopulate)
        .exec();

    const allSubs = await Subscription.find({
        _id: {
            $in: [
                ...(student.subscriptions ?? []),
                subscription._id,
            ],
        },
    })
        .populate(subscriptionPlanPopulate)
        .sort({ createdAt: -1 })
        .exec();

    res.status(201).json({
        message: 'Subscription activated (simulated payment)',
        subscription: subscriptionToJson(populated),
        subscriptions: allSubs.map((s) => subscriptionToJson(s)),
    });
});

export {
    subscribeStudent,
    subscriptionToJson,
    subscriptionPlanPopulate,
    studentSubscriptionsPopulate,
    refreshStudentSubscriptions,
    getStudentActiveSubscription,
};
