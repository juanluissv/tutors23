import express from 'express';
import { protectSchoolAdmin } from '../middleware/authMiddleware.js';
import { createSchool, getSchoolById, updateSchoolById } from '../controllers/schoolController.js';

const router = express.Router();

router.route('/').post(protectSchoolAdmin, createSchool);
router
    .route('/:id')
    .get(protectSchoolAdmin, getSchoolById)
    .put(protectSchoolAdmin, updateSchoolById);

export default router;
