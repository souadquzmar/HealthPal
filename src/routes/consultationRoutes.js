import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { bookConsultation, getPatientConsultations } from '../controllers/consultationController.js';

const router = express.Router();

router.post('/consultations/book',verifyToken, bookConsultation);
router.get('/consultations/patient/:id',verifyToken,getPatientConsultations);
export default router;