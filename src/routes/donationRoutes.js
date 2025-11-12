import express from 'express';
import { verifyRole, verifyToken } from '../middlewares/authMiddleware.js';
import { makeDonation } from '../controllers/donationController.js';

const router = express.Router();

router.post('/donations',verifyToken,verifyRole(['donor']), makeDonation);

export default router;