import asyncHandler from 'express-async-handler'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Answer from '../models/answerModel.js'
import Question from '../models/questionModel.js'
import {
    getS3,
    getBookBucketName,
    getAnswerVideoKeyPrefix,
    getPublicBookUrlFromKey,
} from '../config/s3Client.js'

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
    getStudentNewAnswers,
}
