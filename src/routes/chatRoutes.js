import express from 'express';
const router = express.Router();
import { protectStudent } from '../middleware/authMiddleware.js';
import { getChat } from '../controllers/chatController.js';

router.route('/').post(protectStudent, getChat);

export default router;