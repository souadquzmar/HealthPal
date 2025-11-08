import express from 'express';
import { getCaseById, listCases } from '../controllers/caseController.js';
import {verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/cases',verifyToken,listCases);
router.get('/cases/:id',verifyToken,getCaseById);

export default router;