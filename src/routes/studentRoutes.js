import express from 'express';
import { protectStudent } from '../middleware/authMiddleware.js';
import { 
        authStudent, 
        registerStudent,
        logoutStudent,
        GetStudentProfile,
        updateStudentProfile,
        getMySubjects,
} from '../controllers/studentController.js';

const router = express.Router();

router.route('/login').post(authStudent);
router.route('/register').post(registerStudent);

router.route('/logout').post(logoutStudent);

router.route('/profile').get(protectStudent, GetStudentProfile);
router.route('/profile').put(protectStudent, updateStudentProfile);
router.route('/mysubjects').get(protectStudent, getMySubjects);

export default router;