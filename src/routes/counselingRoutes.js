import express from 'express';
import { getAllCounselors, createCounselor, scheduleSession, updateSessionStatus } from '../controllers/counselingController.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/counselors', verifyToken, getAllCounselors);
router.post('/counselors', verifyToken, verifyRole(['admin', 'doctor']), createCounselor);
router.post('/counselors/schedule', verifyToken, verifyRole(['patient']), scheduleSession);
router.put('/sessions/:sessionId', verifyToken, updateSessionStatus);

export default router;
