import express from 'express';
import { protectSchoolAdmin } from '../middleware/authMiddleware.js';
import {
    createPlan,
    getPlansBySchool,
    getPlanById,
    getPlanSubscriptions,
    updatePlanById,
} from '../controllers/planController.js';

const router = express.Router();

router
    .route('/school/:schoolId')
    .get(protectSchoolAdmin, getPlansBySchool);

router.route('/').post(protectSchoolAdmin, createPlan);

router
    .route('/:id/subscriptions')
    .get(protectSchoolAdmin, getPlanSubscriptions);

router
    .route('/:id')
    .get(protectSchoolAdmin, getPlanById)
    .put(protectSchoolAdmin, updatePlanById);

export default router;
