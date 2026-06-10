import express from 'express';
const router = express.Router();
import { protectStudent } from '../middleware/authMiddleware.js';
import { generateSpeech } from '../controllers/ttsController.js';

router.route('/').post(protectStudent, generateSpeech);

export default router;
