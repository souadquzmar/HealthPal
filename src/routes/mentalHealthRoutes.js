import express from 'express';
import {
  getCounselors,
  bookCounselingSession,
  createSupportGroup,
  getSupportGroups,
  createGroupPost,
  getGroupPosts,
  startAnonymousTherapy,
  sendTherapyMessage,
  getTherapyMessages
} from '../controllers/mentalHealthController.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/counselors', getCounselors);
router.post('/counseling/book', verifyToken, verifyRole(['patient']), bookCounselingSession);

router.post('/groups', verifyToken, createSupportGroup);
router.get('/groups', getSupportGroups);
router.post('/groups/post', verifyToken, createGroupPost);
router.get('/groups/:group_id/posts', getGroupPosts);

router.post('/therapy/start', verifyToken, verifyRole(['patient']), startAnonymousTherapy);
router.post('/therapy/message', verifyToken, sendTherapyMessage);
router.get('/therapy/:session_id/messages', verifyToken, getTherapyMessages);

export default router;