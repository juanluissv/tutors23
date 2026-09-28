import express from 'express';
import { protectSchoolAdmin } from '../middleware/authMiddleware.js';
import {
	authSchoolAdmin,
	authSuperAdmin,
	registerSchoolAdmin,
	registerSuperAdmin,
	getSchoolsForSuperAdminLogin,
	logoutSchoolAdmin,
	updateSchoolAdminProfile,
} from '../controllers/schoolAdminControllers.js';

const router = express.Router();

router.route('/register').post(registerSchoolAdmin);
router.route('/superregister').post(registerSuperAdmin);
router.post('/login', authSchoolAdmin);
router.post('/superlogin', authSuperAdmin);
router.get('/superadmin/schools', getSchoolsForSuperAdminLogin);
router.post('/logout', logoutSchoolAdmin);
router.put('/profile', protectSchoolAdmin, updateSchoolAdminProfile);

export default router;