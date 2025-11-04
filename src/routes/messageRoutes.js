import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getMessagesByConsultations, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/messages/send',verifyToken,verifyRole(['doctor','patient']),sendMessage);
router.get('/messages/:consultationId',verifyToken,verifyRole(['doctor','patient']),getMessagesByConsultations);

export default router;