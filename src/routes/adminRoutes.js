import express from 'express';
import { verifyDoctor } from '../controllers/adminController.js';
import { verifyAdmin, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.patch('/verifyDoctor/:id',verifyToken,verifyAdmin,verifyDoctor);

export default router;