import express from 'express'
import { protectStudent, protectTeacher } from '../middleware/authMiddleware.js'
import { parseStudentQuestionVideo } from '../middleware/studentQuestionVideoUpload.js'
import {
    createStudentQuestion,
    uploadStudentQuestionVideo,
    getQuestionByIdForTeacher,
    getQuestionVideoForTeacher,
    getQuestionsByTeacherId,
    getStudentPreviousQuestionsWithAnswers,
    getTeacherPreviousQuestionsWithAnswers,
    getQuestionByIdForStudent,
    getQuestionVideoForStudent,
} from '../controllers/questionsController.js'

const router = express.Router()

router
    .route('/student/previous')
    .get(protectStudent, getStudentPreviousQuestionsWithAnswers)

router
    .route('/student/question/:questionId')
    .get(protectStudent, getQuestionByIdForStudent)

router
    .route('/student/question/:questionId/video')
    .get(protectStudent, getQuestionVideoForStudent)

router
    .route('/student/:questionId/video')
    .post(
        protectStudent,
        parseStudentQuestionVideo,
        uploadStudentQuestionVideo,
    )

router.route('/student').post(protectStudent, createStudentQuestion)

router
    .route('/teacher/question/:questionId/video')
    .get(protectTeacher, getQuestionVideoForTeacher)

router
    .route('/teacher/question/:questionId')
    .get(protectTeacher, getQuestionByIdForTeacher)

router
    .route('/teacher/previous')
    .get(protectTeacher, getTeacherPreviousQuestionsWithAnswers)

router
    .route('/teacher/:teacherId')
    .get(protectTeacher, getQuestionsByTeacherId)

export default router
