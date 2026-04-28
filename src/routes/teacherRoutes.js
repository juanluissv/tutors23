import express from 'express';
import { protectTeacher } from '../middleware/authMiddleware.js';
import { 
        authTeacher, 
        registerTeacher,
        logoutTeacher
} from '../controllers/teacherController.js';

const router = express.Router();


router.route('/register').post(registerTeacher);
router.post('/login', authTeacher);
router.post('/logout', logoutTeacher);



export default router;