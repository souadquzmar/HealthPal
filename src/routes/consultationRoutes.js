import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { bookConsultation } from '../controllers/consultationController.js';

const router = express.Router();

router.post('/consultations/book',verifyToken, bookConsultation);

export default router;