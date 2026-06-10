import asyncHandler from 'express-async-handler'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Question from '../models/questionModel.js'
import Answer from '../models/answerModel.js'
import Subject from '../models/subjectModel.js'
import School from '../models/schoolModel.js'
import SchoolAdmin from '../models/schoolAdminModel.js'
import {
    getS3,
    getBookBucketName,
    getQuestionVideoKeyPrefix,
    getPublicBookUrlFromKey,
} from '../config/s3Client.js'
import { getStudentActiveSubscription } from './subscriptionController.js'

// POST /api/questions/student — enrolled student asks a question
const createStudentQuestion = asyncHandler(async (req, res) => {
    const { title, description, subject: subjectId } = req.body
    const titleTrim = String(title ?? '').trim()
    if (!titleTrim) {
        res.status(400)
        throw new Error('Title is required')
    }

    if (!subjectId || !mongoose.Types.ObjectId.isValid(String(subjectId))) {
        res.status(400)
        throw new Error('A valid subject is required')
    }

    const subject = await Subject.findById(subjectId)

    if (!subject) {
        res.status(404)
        throw new Error('Subject not found')
    }

    const sid = String(req.student._id)
    const enrolled = (subject.students || []).some(
        (s) => String(s) === sid,
    )
    if (!enrolled) {
        res.status(403)
        throw new Error('You are not enrolled in this subject')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to ask questions',
        )
    }

    const teachers = subject.teachers || []
    if (teachers.length === 0) {
        res.status(400)
        throw new Error('This subject has no teacher assigned yet')
    }

    const teacherId = teachers[0]

    const question = await Question.create({
        title: titleTrim,
        description: String(description ?? '').trim() || undefined,
        student: req.student._id,
        teacher: teacherId,
        subject: subject._id,
        dateCreated: new Date(),
        isAnswer: false,
    })

    await Subject.updateOne(
        { _id: subject._id },
        { $addToSet: { questions: question._id } },
    )

    res.status(201).json({
        _id: question._id,
        title: question.title,
        description: question.description,
        subject: question.subject,
        student: question.student,
        teacher: question.teacher,
        dateCreated: question.dateCreated,
    })
})

// POST /api/questions/student/:questionId/video — student uploads screen recording
const uploadStudentQuestionVideo = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    if (!req.file?.buffer) {
        res.status(400)
        throw new Error('Video file is required')
    }

    const question = await Question.findById(questionId)

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    if (String(question.student) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to update this question')
    }

    const s3 = getS3()
    const bucket = getBookBucketName()
    if (!s3 || !bucket) {
        res.status(503)
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        )
    }

    const prefix = getQuestionVideoKeyPrefix()
    const random = crypto.randomBytes(8).toString('hex')
    const studentPart = String(req.student._id)
    const key = `${prefix}/${questionId}/${studentPart}-${random}.webm`

    const previousKey = question.mediaId
        && String(question.mediaId).trim() !== ''
        ? String(question.mediaId).trim()
        : null
    const isFirstVideoUpload = !previousKey

    let subscription = null
    if (isFirstVideoUpload) {
        subscription = await getStudentActiveSubscription(req.student._id)
        if (!subscription) {
            res.status(403)
            throw new Error(
                'An active subscription is required to ask questions',
            )
        }

        const questionsLeft = Number(subscription.questionsLeft) || 0
        if (questionsLeft <= 0) {
            res.status(403)
            throw new Error(
                'You have no questions remaining on your subscription',
            )
        }
    }

    const contentType = req.file.mimetype
        && String(req.file.mimetype).trim() !== ''
        ? req.file.mimetype
        : 'video/webm'

    try {
        const upload = await s3.upload({
            Bucket: bucket,
            Key: key,
            Body: req.file.buffer,
            ContentType: contentType,
        }).promise()

        question.mediaId = upload.Key
        await question.save()

        if (isFirstVideoUpload && subscription) {
            subscription.questionsAsked =
                (subscription.questionsAsked ?? 0) + 1
            subscription.questionsLeft = Math.max(
                0,
                (Number(subscription.totalQuestions) || 0)
                    - subscription.questionsAsked,
            )
            await subscription.save()
        }

        if (previousKey && previousKey !== upload.Key) {
            try {
                await s3.deleteObject({
                    Bucket: bucket,
                    Key: previousKey,
                }).promise()
            } catch (delErr) {
                console.error(
                    'Could not delete previous question video from S3:',
                    delErr,
                )
            }
        }

        res.status(200).json({
            _id: question._id,
            mediaId: question.mediaId,
        })
    } catch (err) {
        console.error(err)
        res.status(502)
        throw new Error('Failed to upload the video to storage.')
    }
})

// GET /api/questions/teacher/question/:questionId — assigned teacher only
const getQuestionByIdForTeacher = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)
        .populate('subject', 'title')
        .populate('student', 'firstname lastname email')
        .populate('answer', 'description title')
        .lean()

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    if (String(question.teacher) !== String(req.teacher._id)) {
        res.status(403)
        throw new Error('Not authorized to view this question')
    }

    res.status(200).json(question)
})

// GET /api/questions/teacher/question/:questionId/video — redirect to file
const getQuestionVideoForTeacher = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    if (String(question.teacher) !== String(req.teacher._id)) {
        res.status(403)
        throw new Error('Not authorized to view this video')
    }

    const key = question.mediaId && String(question.mediaId).trim() !== ''
        ? String(question.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this question')
    }

    const direct = getPublicBookUrlFromKey(key)
    if (direct) {
        return res.redirect(302, direct)
    }

    const s3 = getS3()
    const bucket = getBookBucketName()
    if (!s3 || !bucket) {
        res.status(503)
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        )
    }

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 60,
        ResponseContentType: 'video/webm',
    })
    return res.redirect(302, url)
})

// GET /api/questions/teacher/:teacherId — use with protectTeacher; own id only
const getQuestionsByTeacherId = asyncHandler(async (req, res) => {
    const { teacherId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(teacherId))) {
        res.status(400)
        throw new Error('Invalid teacher id')
    }

    if (String(req.teacher._id) !== String(teacherId)) {
        res.status(403)
        throw new Error('Not authorized to view questions for this teacher')
    }

    const questions = await Question.find({ teacher: teacherId })
        .populate('subject', 'title')
        .populate('student', 'firstname lastname email')
        .populate('answer', 'mediaId')
        .sort({ dateCreated: -1, createdAt: -1 })
        .lean()

    res.status(200).json(questions)
})

// GET /api/questions/student/previous?page=&limit=
// Student questions with video (answered or awaiting reply)
const getStudentPreviousQuestionsWithAnswers = asyncHandler(
    async (req, res) => {
        const subscription = await getStudentActiveSubscription(
            req.student._id,
        )
        if (!subscription) {
            res.status(403)
            throw new Error(
                'An active subscription is required to view questions',
            )
        }

        const rawPage = parseInt(String(req.query.page ?? '1'), 10)
        const rawLimit = parseInt(String(req.query.limit ?? '1'), 10)
        const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
        const limit = Number.isFinite(rawLimit)
            ? Math.min(50, Math.max(1, rawLimit))
            : 1
        const skip = (page - 1) * limit

        let subjectFilter = {}
        const qSubject = req.query.subject
        if (
            qSubject
            && mongoose.Types.ObjectId.isValid(String(qSubject))
        ) {
            subjectFilter = { subject: qSubject }
        }

        const filter = {
            student: req.student._id,
            ...subjectFilter,
            $expr: {
                $gt: [
                    {
                        $strLenCP: {
                            $trim: {
                                input: {
                                    $ifNull: ['$mediaId', ''],
                                },
                            },
                        },
                    },
                    0,
                ],
            },
        }

        const total = await Question.countDocuments(filter)

        const questions = await Question.find(filter)
            .sort({ dateCreated: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('subject', 'title')
            .populate('teacher', 'firstname lastname')
            .populate({
                path: 'answer',
                select: 'title description mediaId dateCreated teacher',
                populate: {
                    path: 'teacher',
                    select: 'firstname lastname',
                },
            })
            .lean()

        const pages = total === 0 ? 0 : Math.ceil(total / limit)

        res.status(200).json({
            items: questions,
            page,
            pages,
            total,
            limit,
        })
    },
)

// GET /api/questions/teacher/previous?subject=&page=&limit=
// answered Q&A for logged-in teacher (optional subject filter)
const getTeacherPreviousQuestionsWithAnswers = asyncHandler(
    async (req, res) => {
        const rawPage = parseInt(String(req.query.page ?? '1'), 10)
        const rawLimit = parseInt(String(req.query.limit ?? '1'), 10)
        const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
        const limit = Number.isFinite(rawLimit)
            ? Math.min(50, Math.max(1, rawLimit))
            : 1
        const skip = (page - 1) * limit

        let subjectFilter = {}
        const qSubject = req.query.subject
        if (
            qSubject
            && mongoose.Types.ObjectId.isValid(String(qSubject))
        ) {
            subjectFilter = { subject: qSubject }
        }

        const filter = {
            teacher: req.teacher._id,
            answer: { $exists: true, $ne: null },
            ...subjectFilter,
        }

        const total = await Question.countDocuments(filter)

        const questions = await Question.find(filter)
            .sort({ dateCreated: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('subject', 'title')
            .populate('student', 'firstname lastname email')
            .populate({
                path: 'answer',
                select: 'title description mediaId dateCreated teacher',
                populate: {
                    path: 'teacher',
                    select: 'firstname lastname',
                },
            })
            .lean()

        const pages = total === 0 ? 0 : Math.ceil(total / limit)

        res.status(200).json({
            items: questions,
            page,
            pages,
            total,
            limit,
        })
    },
)

// GET /api/questions/schooladmin/previous?subject=&page=&limit=
const getSchoolAdminPreviousQuestionsWithAnswers = asyncHandler(
    async (req, res) => {
        const rawPage = parseInt(String(req.query.page ?? '1'), 10)
        const rawLimit = parseInt(String(req.query.limit ?? '1'), 10)
        const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
        const limit = Number.isFinite(rawLimit)
            ? Math.min(50, Math.max(1, rawLimit))
            : 1
        const skip = (page - 1) * limit

        const qSubject = req.query.subject
        if (
            !qSubject
            || !mongoose.Types.ObjectId.isValid(String(qSubject))
        ) {
            res.status(400)
            throw new Error('A valid subject id is required')
        }

        const subject = await Subject.findById(qSubject)
            .select('school')
            .lean()

        if (!subject) {
            res.status(404)
            throw new Error('Subject not found')
        }

        const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id)

        if (!schoolAdmin) {
            res.status(404)
            throw new Error('School admin not found')
        }

        if (
            schoolAdmin.school
            && String(schoolAdmin.school) !== String(subject.school)
        ) {
            res.status(403)
            throw new Error('Not authorized to view questions for this subject')
        }

        const school = await School.findById(subject.school)
            .select('admin')
            .lean()

        if (!school) {
            res.status(404)
            throw new Error('School not found')
        }

        if (
            !school.admin
            || String(school.admin) !== String(req.schoolAdmin._id)
        ) {
            res.status(403)
            throw new Error('Not authorized to view questions for this subject')
        }

        const filter = {
            subject: qSubject,
            answer: { $exists: true, $ne: null },
        }

        const total = await Question.countDocuments(filter)

        const questions = await Question.find(filter)
            .sort({ dateCreated: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('subject', 'title')
            .populate('student', 'firstname lastname email')
            .populate('teacher', 'firstname lastname')
            .populate({
                path: 'answer',
                select: 'title description mediaId dateCreated teacher',
                populate: {
                    path: 'teacher',
                    select: 'firstname lastname',
                },
            })
            .lean()

        const pages = total === 0 ? 0 : Math.ceil(total / limit)

        res.status(200).json({
            items: questions,
            page,
            pages,
            total,
            limit,
        })
    },
)

async function verifySchoolAdminSubjectAccess (req, res, subjectId) {
    if (!subjectId || !mongoose.Types.ObjectId.isValid(String(subjectId))) {
        res.status(400)
        throw new Error('Invalid subject')
    }

    const subject = await Subject.findById(subjectId).select('school').lean()

    if (!subject) {
        res.status(404)
        throw new Error('Subject not found')
    }

    const schoolAdmin = await SchoolAdmin.findById(req.schoolAdmin._id)

    if (!schoolAdmin) {
        res.status(404)
        throw new Error('School admin not found')
    }

    if (
        schoolAdmin.school
        && String(schoolAdmin.school) !== String(subject.school)
    ) {
        res.status(403)
        throw new Error('Not authorized to view content for this subject')
    }

    const school = await School.findById(subject.school)
        .select('admin')
        .lean()

    if (!school) {
        res.status(404)
        throw new Error('School not found')
    }

    if (
        !school.admin
        || String(school.admin) !== String(req.schoolAdmin._id)
    ) {
        res.status(403)
        throw new Error('Not authorized to view content for this subject')
    }
}

// GET /api/questions/schooladmin/question/:questionId
const getQuestionByIdForSchoolAdmin = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)
        .populate('subject', 'title')
        .populate('student', 'firstname lastname')
        .populate('teacher', 'firstname lastname')
        .lean()

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    const subjectId = question.subject?._id ?? question.subject
    await verifySchoolAdminSubjectAccess(req, res, subjectId)

    res.status(200).json(question)
})

// GET /api/questions/schooladmin/question/:questionId/video
const getQuestionVideoForSchoolAdmin = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    await verifySchoolAdminSubjectAccess(req, res, question.subject)

    const key = question.mediaId && String(question.mediaId).trim() !== ''
        ? String(question.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this question')
    }

    const direct = getPublicBookUrlFromKey(key)
    if (direct) {
        return res.redirect(302, direct)
    }

    const s3 = getS3()
    const bucket = getBookBucketName()
    if (!s3 || !bucket) {
        res.status(503)
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        )
    }

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 60,
        ResponseContentType: 'video/webm',
    })
    return res.redirect(302, url)
})

// GET /api/questions/student/question/:questionId — student's own question metadata
const getQuestionByIdForStudent = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)
        .populate('subject', 'title')
        .populate('teacher', 'firstname lastname')
        .lean()

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    if (String(question.student) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to view this question')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to view questions',
        )
    }

    res.status(200).json(question)
})

// GET /api/questions/student/question/:questionId/video — student's own question video
const getQuestionVideoForStudent = asyncHandler(async (req, res) => {
    const { questionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(questionId))) {
        res.status(400)
        throw new Error('Invalid question id')
    }

    const question = await Question.findById(questionId)

    if (!question) {
        res.status(404)
        throw new Error('Question not found')
    }

    if (String(question.student) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to view this video')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to view questions',
        )
    }

    const key = question.mediaId && String(question.mediaId).trim() !== ''
        ? String(question.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this question')
    }

    const direct = getPublicBookUrlFromKey(key)
    if (direct) {
        return res.redirect(302, direct)
    }

    const s3 = getS3()
    const bucket = getBookBucketName()
    if (!s3 || !bucket) {
        res.status(503)
        throw new Error(
            'File storage is not configured. Set AWS credentials and '
            + 'AWS_S3_BUCKET.',
        )
    }

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 60,
        ResponseContentType: 'video/webm',
    })
    return res.redirect(302, url)
})

export {
    createStudentQuestion,
    uploadStudentQuestionVideo,
    getQuestionByIdForTeacher,
    getQuestionVideoForTeacher,
    getQuestionsByTeacherId,
    getStudentPreviousQuestionsWithAnswers,
    getTeacherPreviousQuestionsWithAnswers,
    getSchoolAdminPreviousQuestionsWithAnswers,
    getQuestionByIdForSchoolAdmin,
    getQuestionVideoForSchoolAdmin,
    getQuestionByIdForStudent,
    getQuestionVideoForStudent,
}
