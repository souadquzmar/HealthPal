import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getCaseDonors, getDashboardTransactions, getDonationById, getDonationReceipt, getDonorDonations, makeDonation } from '../controllers/donationController.js';

const router = express.Router();

router.post('/donations',verifyToken,verifyRole(['donor']), makeDonation);
router.get('/donations/:id',verifyToken,getDonationById);
router.get('/donations/donor/:id',verifyToken,getDonorDonations);
router.get('/cases/:id/donors',getCaseDonors);
router.get('/receipts/:donationId',verifyToken,verifyRole(['donor','admin']),getDonationReceipt);
router.get('/dashboard/transactions', verifyToken, verifyRole(['ngo', 'admin' , 'patient' , 'donor']), getDashboardTransactions);

export default router;