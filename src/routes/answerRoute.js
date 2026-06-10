import express from 'express'
import { protectTeacher, protectStudent, protectSchoolAdmin } from '../middleware/authMiddleware.js'
import { parseTeacherAnswerVideo } from '../middleware/teacherAnswerVideoUpload.js'
import {
    createTeacherAnswerForQuestion,
    uploadTeacherAnswerVideo,
    getAnswerByIdForStudent,
    getAnswerByIdForTeacher,
    getAnswerVideoForStudent,
    getAnswerVideoForTeacher,
    getAnswerByIdForSchoolAdmin,
    getAnswerVideoForSchoolAdmin,
    getStudentNewAnswers,
} from '../controllers/answersController.js'

const router = express.Router()

router
    .route('/student/:studentId/new')
    .get(protectStudent, getStudentNewAnswers)

router
    .route('/schooladmin/:answerId/video')
    .get(protectSchoolAdmin, getAnswerVideoForSchoolAdmin)

router
    .route('/schooladmin/:answerId')
    .get(protectSchoolAdmin, getAnswerByIdForSchoolAdmin)

router
    .route('/student/:answerId/video')
    .get(protectStudent, getAnswerVideoForStudent)

router
    .route('/student/:answerId')
    .get(protectStudent, getAnswerByIdForStudent)

router
    .route('/teacher/:answerId/video')
    .get(protectTeacher, getAnswerVideoForTeacher)
    .post(
        protectTeacher,
        parseTeacherAnswerVideo,
        uploadTeacherAnswerVideo,
    )

router
    .route('/teacher/:answerId')
    .get(protectTeacher, getAnswerByIdForTeacher)

router
    .route('/teacher/question/:questionId')
    .post(protectTeacher, createTeacherAnswerForQuestion)

export default router
