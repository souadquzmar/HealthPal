import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getCaseDonors, getDonationById, getDonorDonations, makeDonation } from '../controllers/donationController.js';

const router = express.Router();

router.post('/donations',verifyToken,verifyRole(['donor']), makeDonation);
router.get('/donations/:id',verifyToken,getDonationById);
router.get('/donations/donor/:id',verifyToken,getDonorDonations);
router.get('/cases/:id/donors',getCaseDonors);
export default router;