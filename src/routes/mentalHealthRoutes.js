import express from 'express';
import {
  getCounselors,
  bookCounselingSession,
  getMyCounselingSessions,
  getSupportGroups,
  createSupportGroup,
  getGroupPosts,
  postInGroup,
  deleteGroupPost,
  startTherapySession,
  sendTherapyMessage,
  getTherapyMessages,
  endTherapySession
} from '../controllers/mentalHealthController.js';

import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/counselors', getCounselors);
router.post('/counseling/book', verifyToken, verifyRole(['patient']), bookCounselingSession);
router.get('/counseling/my', verifyToken, verifyRole(['patient']), getMyCounselingSessions);

router.get('/groups', getSupportGroups);
router.post('/groups', verifyToken, verifyRole(['admin', 'doctor']), createSupportGroup);
router.get('/groups/:groupId/posts', getGroupPosts);
router.post('/groups/:groupId/posts', verifyToken, postInGroup);
router.delete('/groups/:groupId/posts/:postId', verifyToken, deleteGroupPost);

router.post('/therapy/start', verifyToken, startTherapySession);
router.post('/therapy/:sessionId/message', verifyToken, sendTherapyMessage);
router.get('/therapy/:sessionId', verifyToken, getTherapyMessages);
router.patch('/therapy/:sessionId/end', verifyToken, endTherapySession);

export default router;