import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Plan from '../models/planModel.js';
import Student from '../models/studentModel.js';
import Subscription from '../models/subscriptionModel.js';
import { assertSchoolAdminOwnsSchool } from './schoolController.js';
import { REVENUE_SHARE } from '../utils/revenueShare.js';

function roundMoney (value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function getPaymentDate (subscription) {
    if (subscription.startDate) {
        return new Date(subscription.startDate);
    }
    return new Date(subscription.createdAt);
}

function monthKey (date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function buildMonthBuckets (monthsCount, now = new Date()) {
    const buckets = [];
    const cursor = new Date(now.getFullYear(), now.getMonth(), 1);

    for (let i = monthsCount - 1; i >= 0; i -= 1) {
        const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
        const key = monthKey(d);
        const label = d.toLocaleDateString(undefined, {
            month: 'short',
            year: d.getMonth() === 0 || i === monthsCount - 1
                ? 'numeric'
                : undefined,
        });
        buckets.push({
            key,
            label,
            year: d.getFullYear(),
            month: d.getMonth(),
            earnings: 0,
            payments: 0,
        });
    }

    return buckets;
}

function transactionStatus (subscription) {
    if (subscription.pastDue === true) {
        return 'Past due';
    }
    return 'Succeeded';
}

function nextPayoutDate (now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function buildStudentLookup (students) {
    const bySubId = new Map();

    for (const student of students) {
        for (const subId of student.subscriptions ?? []) {
            bySubId.set(String(subId), student);
        }
    }

    return bySubId;
}

function getGrossAmount (subscription, planPrice) {
    if (subscription.amountPaid != null) {
        return roundMoney(subscription.amountPaid);
    }
    return roundMoney(planPrice);
}

function countsTowardEarnings (subscription) {
    return subscription.pastDue !== true;
}

function transactionToJson (subscription, planPrice, student) {
    const paymentDate = getPaymentDate(subscription);
    const gross = getGrossAmount(subscription, planPrice);
    const earned = countsTowardEarnings(subscription);
    const net = earned ? roundMoney(gross * REVENUE_SHARE) : 0;
    const studentName = student
        ? [
            student.firstname,
            student.lastname,
        ].filter(Boolean).join(' ').trim()
        : null;

    return {
        _id: subscription._id,
        date: paymentDate.toISOString(),
        status: transactionStatus(subscription),
        type: 'Payment',
        grossAmount: gross,
        netAmount: net,
        currency: 'USD',
        student: student
            ? {
                _id: student._id,
                name: studentName || student.email,
                email: student.email,
            }
            : null,
        planId: subscription.plan?._id ?? subscription.plan ?? null,
    };
}

function activityToJson (subscription, planPrice, student) {
    const paymentDate = getPaymentDate(subscription);
    const gross = getGrossAmount(subscription, planPrice);
    const net = countsTowardEarnings(subscription)
        ? roundMoney(gross * REVENUE_SHARE)
        : 0;
    const studentName = student
        ? [
            student.firstname,
            student.lastname,
        ].filter(Boolean).join(' ').trim()
        : 'A student';

    return {
        _id: subscription._id,
        date: paymentDate.toISOString(),
        message: `${studentName} subscribed — ${net.toFixed(2)} USD earned`,
        netAmount: net,
    };
}

// GET /api/schools/:id/earnings — school admin revenue share dashboard
const getSchoolEarnings = asyncHandler(async (req, res) => {
    const { id: schoolId } = req.params;
    const rawMonths = Number.parseInt(req.query.months, 10);
    const monthsCount = Number.isNaN(rawMonths)
        ? 12
        : Math.min(Math.max(rawMonths, 1), 24);

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        res.status(400);
        throw new Error('Invalid school id');
    }

    await assertSchoolAdminOwnsSchool(
        res,
        req.schoolAdmin._id,
        schoolId,
    );

    const schoolPlans = await Plan.find({ school: schoolId })
        .select('_id price')
        .lean();

    const planIds = schoolPlans.map((p) => p._id);
    const planPriceById = new Map(
        schoolPlans.map((p) => [String(p._id), Number(p.price) || 0]),
    );

    if (planIds.length === 0) {
        const emptyMonths = buildMonthBuckets(monthsCount);
        res.status(200).json({
            revenueShare: REVENUE_SHARE,
            summary: {
                lifetimeEarnings: 0,
                totalEarnings: 0,
                totalBalance: 0,
                availableToPayout: 0,
                totalPayments: 0,
                totalSubscriptions: 0,
                periodEarnings: 0,
                nextPayoutDate: nextPayoutDate().toISOString(),
            },
            monthlyEarnings: emptyMonths.map((b) => ({
                key: b.key,
                label: b.label,
                earnings: 0,
                payments: 0,
            })),
            transactions: [],
            activity: [],
        });
        return;
    }

    const subscriptions = await Subscription.find({
        plan: { $in: planIds },
    })
        .populate({ path: 'plan', select: 'price school' })
        .sort({ createdAt: -1 })
        .lean();

    const subIds = subscriptions.map((s) => s._id);
    const students = subIds.length > 0
        ? await Student.find({ subscriptions: { $in: subIds } })
            .select('firstname lastname email subscriptions')
            .lean()
        : [];

    const studentBySubId = buildStudentLookup(students);
    const now = new Date();
    const monthBuckets = buildMonthBuckets(monthsCount, now);
    const bucketByKey = new Map(
        monthBuckets.map((b) => [b.key, b]),
    );
    const periodStart = new Date(
        monthBuckets[0].year,
        monthBuckets[0].month,
        1,
    );

    let lifetimeEarnings = 0;
    let periodEarnings = 0;
    let totalPayments = 0;
    const transactions = [];
    const activity = [];

    for (const sub of subscriptions) {
        const planRef = sub.plan;
        const planId = planRef?._id ?? planRef;
        const planPrice = planRef && typeof planRef === 'object' && planRef.price != null
            ? Number(planRef.price) || 0
            : planPriceById.get(String(planId)) ?? 0;

        const gross = getGrossAmount(sub, planPrice);
        const earned = countsTowardEarnings(sub);
        const net = earned ? roundMoney(gross * REVENUE_SHARE) : 0;

        if (earned) {
            totalPayments += 1;
            lifetimeEarnings = roundMoney(lifetimeEarnings + net);

            const paymentDate = getPaymentDate(sub);
            const key = monthKey(paymentDate);
            const bucket = bucketByKey.get(key);

            if (bucket) {
                bucket.earnings = roundMoney(bucket.earnings + net);
                bucket.payments += 1;
            }

            if (paymentDate >= periodStart) {
                periodEarnings = roundMoney(periodEarnings + net);
            }
        }

        const student = studentBySubId.get(String(sub._id)) ?? null;
        transactions.push(transactionToJson(sub, planPrice, student));
        if (earned) {
            activity.push(activityToJson(sub, planPrice, student));
        }
    }

    res.status(200).json({
        revenueShare: REVENUE_SHARE,
        summary: {
            lifetimeEarnings,
            totalEarnings: lifetimeEarnings,
            totalBalance: lifetimeEarnings,
            availableToPayout: lifetimeEarnings,
            totalPayments,
            totalSubscriptions: subscriptions.length,
            periodEarnings,
            nextPayoutDate: nextPayoutDate(now).toISOString(),
        },
        monthlyEarnings: monthBuckets.map((b) => ({
            key: b.key,
            label: b.label,
            earnings: b.earnings,
            payments: b.payments,
        })),
        transactions: transactions.slice(0, 50),
        activity: activity.slice(0, 8),
    });
});

export { getSchoolEarnings };
