import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { getDonationById, makeDonation } from '../controllers/donationController.js';

const router = express.Router();

router.post('/donations',verifyToken,verifyRole(['donor']), makeDonation);
router.get('/donations/:id',verifyToken,getDonationById);
export default router;