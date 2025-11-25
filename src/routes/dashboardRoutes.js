import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';

import { getDashboardTransactions, getDonationReceipt,getPatientProfile} from '../controllers/dashboardController.js';

const router = express.Router();
router.get('/patients/:id/profile',verifyToken,verifyRole(['patient','admin','doctor']),getPatientProfile);
router.get('/receipts/:donationId',verifyToken,verifyRole(['donor','admin']),getDonationReceipt);
router.get('/dashboard/transactions', verifyToken, verifyRole(['ngo', 'admin' , 'patient' , 'donor']), getDashboardTransactions);
export default router;