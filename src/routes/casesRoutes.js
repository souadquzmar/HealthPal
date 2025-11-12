import express from 'express';
import { createCase, getCaseById, listCases, updateCase } from '../controllers/caseController.js';
import {verifyRole, verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/cases',verifyToken,listCases);
router.get('/cases/:id',verifyToken,getCaseById);
router.post('/cases/create',verifyToken,verifyRole(['patient']),createCase);
router.patch('/cases/:id/update',verifyToken,verifyRole(['patient']),updateCase);
export default router;