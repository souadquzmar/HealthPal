import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/messages/send',verifyToken,verifyRole(['doctor','patient']),sendMessage);

export default router;