import express from 'express';
import { protectSchoolAdmin } from '../middleware/authMiddleware.js';
import { 
        authSchoolAdmin, 
        registerSchoolAdmin,
        logoutSchoolAdmin,
        updateSchoolAdminProfile
} from '../controllers/schoolAdminControllers.js';

const router = express.Router();


router.route('/register').post(registerSchoolAdmin);
router.post('/login', authSchoolAdmin);
router.post('/logout', logoutSchoolAdmin);
router.put('/profile', protectSchoolAdmin, updateSchoolAdminProfile);

export default router;