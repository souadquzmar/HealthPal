import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getDonationById, getDonorDonations, makeDonation } from '../controllers/donationController.js';

const router = express.Router();

router.post('/donations',verifyToken,verifyRole(['donor']), makeDonation);
router.get('/donations/:id',verifyToken,getDonationById);
router.get('/donations/donor/:id',verifyToken,getDonorDonations);

export default router;