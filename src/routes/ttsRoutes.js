import express from 'express';
const router = express.Router();
import { generateSpeech } from '../controllers/ttsController.js';

router.route('/').post(generateSpeech);

export default router;
