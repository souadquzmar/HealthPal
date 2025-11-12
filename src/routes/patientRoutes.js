import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getPatientProfile } from '../controllers/patientController.js';

const router = express.Router();
router.get('/patients/:id/profile',verifyToken,verifyRole(['patient','admin','doctor']),getPatientProfile);

export default router;