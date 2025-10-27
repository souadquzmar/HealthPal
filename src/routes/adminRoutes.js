import express from 'express';
import { verifyDoctor } from '../controllers/adminController.js';
import { verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.patch('/verifyDoctor/:id',verifyAdmin,verifyDoctor);

export default router;