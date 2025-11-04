import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { endCall, startCall } from '../controllers/callController.js';

const router = express.Router();

router.post('/call/start',verifyToken,verifyRole(['doctor','patient']),startCall);
router.patch('/call/end/:id',verifyToken,verifyRole(['doctor','patient']),endCall);
export default router;