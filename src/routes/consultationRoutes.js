import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { bookConsultation, getDoctorConsultations, getPatientConsultations, updateConsultationStatus } from '../controllers/consultationController.js';

const router = express.Router();

router.post('/consultations/book',verifyToken,verifyRole(['patient']),bookConsultation);
router.get('/consultations/patient/:id',verifyToken,verifyRole(['patient']),getPatientConsultations);
router.get('/consultations/doctor/:id',verifyToken,verifyRole(['doctor']),getDoctorConsultations);
router.patch('/consultations/:id/status',verifyToken,verifyRole(['doctor','admin']),updateConsultationStatus);
export default router;