import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { startCall } from '../controllers/callController.js';

const router = express.Router();

router.post('/call/start',verifyToken,verifyRole(['doctor','patient']),startCall);

export default router;