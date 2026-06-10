import asyncHandler from 'express-async-handler'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Answer from '../models/answerModel.js'
import Question from '../models/questionModel.js'
import Subject from '../models/subjectModel.js'
import School from '../models/schoolModel.js'
import SchoolAdmin from '../models/schoolAdminModel.js'
import {
    getS3,
    getBookBucketName,
    getAnswerVideoKeyPrefix,
    getPublicBookUrlFromKey,
} from '../config/s3Client.js'
import { getStudentActiveSubscription } from './subscriptionController.js'

// POST /api/answers/teacher/question/:questionId — text answer (description only)
const createTeacherAnswerForQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params
    const { description } = req.body

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
        throw new Error('Not authorized to answer this question')
    }

    const descriptionTrim = String(description ?? '').trim()
    if (!descriptionTrim) {
        res.status(400)
        throw new Error('Description is required')
    }

    const titleFromQuestion = String(question.title ?? '').trim()
    if (!titleFromQuestion) {
        res.status(400)
        throw new Error('Question has no title')
    }

    let answerDoc = null
    if (question.answer) {
        answerDoc = await Answer.findById(question.answer)
    }

    let created = false

    if (!answerDoc) {
        answerDoc = await Answer.create({
            title: titleFromQuestion,
            description: descriptionTrim,
            teacher: req.teacher._id,
            student: question.student,
            subject: question.subject,
            question: question._id,
            dateCreated: new Date(),
            isWatched: false,
        })
        question.answer = answerDoc._id
        created = true
    } else {
        answerDoc.title = titleFromQuestion
        answerDoc.description = descriptionTrim
        await answerDoc.save()
    }

    question.isAnswer = true
    await question.save()

    res.status(created ? 201 : 200).json({
        _id: answerDoc._id,
        title: answerDoc.title,
        description: answerDoc.description,
        question: answerDoc.question,
        teacher: answerDoc.teacher,
        student: answerDoc.student,
        subject: answerDoc.subject,
        dateCreated: answerDoc.dateCreated,
    })
})

// POST /api/answers/teacher/:answerId/video — teacher uploads screen recording
const uploadTeacherAnswerVideo = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    if (!req.file?.buffer) {
        res.status(400)
        throw new Error('Video file is required')
    }

    const answerDoc = await Answer.findById(answerId)

    if (!answerDoc) {
        res.status(404)
        throw new Error('Answer not found')
    }

    if (String(answerDoc.teacher) !== String(req.teacher._id)) {
        res.status(403)
        throw new Error('Not authorized to update this answer')
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

    const prefix = getAnswerVideoKeyPrefix()
    const random = crypto.randomBytes(8).toString('hex')
    const teacherPart = String(req.teacher._id)
    const key = `${prefix}/${answerId}/${teacherPart}-${random}.webm`

    const previousKey = answerDoc.mediaId
        && String(answerDoc.mediaId).trim() !== ''
        ? String(answerDoc.mediaId).trim()
        : null

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

        answerDoc.mediaId = upload.Key
        await answerDoc.save()

        if (previousKey && previousKey !== upload.Key) {
            try {
                await s3.deleteObject({
                    Bucket: bucket,
                    Key: previousKey,
                }).promise()
            } catch (delErr) {
                console.error(
                    'Could not delete previous answer video from S3:',
                    delErr,
                )
            }
        }

        res.status(200).json({
            _id: answerDoc._id,
            mediaId: answerDoc.mediaId,
            question: answerDoc.question,
        })
    } catch (err) {
        console.error(err)
        res.status(502)
        throw new Error('Failed to upload the video to storage.')
    }
})

// GET /api/answers/student/:answerId — student who received the answer only
const getAnswerByIdForStudent = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)
        .populate('subject', 'title')
        .populate('teacher', 'firstname lastname')
        .populate('question', 'title description')
        .lean()

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    if (String(answer.student) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to view this answer')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to view answers',
        )
    }

    res.status(200).json(answer)
})

// GET /api/answers/teacher/:answerId — teacher who created the answer only
const getAnswerByIdForTeacher = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)
        .populate('subject', 'title')
        .populate('student', 'firstname lastname')
        .populate('question', 'title description')
        .lean()

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    if (String(answer.teacher) !== String(req.teacher._id)) {
        res.status(403)
        throw new Error('Not authorized to view this answer')
    }

    res.status(200).json(answer)
})

// GET /api/answers/student/:answerId/video — redirect to stored file
const getAnswerVideoForStudent = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    if (String(answer.student) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to view this video')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to view answers',
        )
    }

    const key = answer.mediaId && String(answer.mediaId).trim() !== ''
        ? String(answer.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this answer')
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

// GET /api/answers/teacher/:answerId/video — teacher who created the answer only
const getAnswerVideoForTeacher = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    if (String(answer.teacher) !== String(req.teacher._id)) {
        res.status(403)
        throw new Error('Not authorized to view this video')
    }

    const key = answer.mediaId && String(answer.mediaId).trim() !== ''
        ? String(answer.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this answer')
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

// GET /api/answers/schooladmin/:answerId
const getAnswerByIdForSchoolAdmin = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)
        .populate('subject', 'title')
        .populate('teacher', 'firstname lastname')
        .populate('student', 'firstname lastname')
        .populate('question', 'title description')
        .lean()

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    const subjectId = answer.subject?._id ?? answer.subject
    await verifySchoolAdminSubjectAccess(req, res, subjectId)

    res.status(200).json(answer)
})

// GET /api/answers/schooladmin/:answerId/video
// Lets a school admin watch an answer video for their school.
// Checks they own the subject, then redirects to the stored video file.
const getAnswerVideoForSchoolAdmin = asyncHandler(async (req, res) => {
    const { answerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(answerId))) {
        res.status(400)
        throw new Error('Invalid answer id')
    }

    const answer = await Answer.findById(answerId)

    if (!answer) {
        res.status(404)
        throw new Error('Answer not found')
    }

    await verifySchoolAdminSubjectAccess(req, res, answer.subject)

    const key = answer.mediaId && String(answer.mediaId).trim() !== ''
        ? String(answer.mediaId).trim()
        : ''

    if (!key) {
        res.status(404)
        throw new Error('No video for this answer')
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

// GET /api/answers/student/:studentId/new — unwatched answers for that student
const getStudentNewAnswers = asyncHandler(async (req, res) => {
    const { studentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(String(studentId))) {
        res.status(400)
        throw new Error('Invalid student id')
    }

    if (String(studentId) !== String(req.student._id)) {
        res.status(403)
        throw new Error('Not authorized to view these answers')
    }

    const subscription = await getStudentActiveSubscription(req.student._id)
    if (!subscription) {
        res.status(403)
        throw new Error(
            'An active subscription is required to view new answers',
        )
    }

    const answers = await Answer.find({
        student: studentId,
        isWatched: false,
    })
        .sort({ dateCreated: -1 })
        .populate('subject', 'title')
        .populate('teacher', 'firstname lastname')
        .populate('question', 'title')

    res.status(200).json(answers)
})

export {
    createTeacherAnswerForQuestion,
    uploadTeacherAnswerVideo,
    getAnswerByIdForStudent,
    getAnswerByIdForTeacher,
    getAnswerVideoForStudent,
    getAnswerVideoForTeacher,
    getAnswerByIdForSchoolAdmin,
    getAnswerVideoForSchoolAdmin,
    getStudentNewAnswers,
}
