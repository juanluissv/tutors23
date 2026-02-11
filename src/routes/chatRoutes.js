import express from 'express';
const router = express.Router();
import { getChat } from '../controllers/chatController.js';

router.route('/').post(getChat);

export default router;