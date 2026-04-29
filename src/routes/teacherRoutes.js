import express from 'express';
import { protectTeacher } from '../middleware/authMiddleware.js';
import {
    authTeacher,
    registerTeacher,
    logoutTeacher,
    getTeacherProfile,
    updateTeacherProfile,
} from '../controllers/teacherController.js';

const router = express.Router();

router.route('/register').post(registerTeacher);
router.post('/login', authTeacher);
router.post('/logout', logoutTeacher);
router
    .route('/profile')
    .get(protectTeacher, getTeacherProfile)
    .put(protectTeacher, updateTeacherProfile);

export default router;
