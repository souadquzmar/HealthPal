import express from 'express';
import { listCases } from '../controllers/caseController.js';
import {verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/cases',verifyToken,listCases);

export default router;