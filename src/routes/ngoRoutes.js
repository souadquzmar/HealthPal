import express from 'express';
import {
  getVerifiedNGOs,
  registerNGO,
  createMedicalMission,
  getMedicalMissions,
  requestMissionSchedule,
  offerDoctorAvailability,
  createMissionNotification,
  getMissionNotifications
} from '../controllers/ngoController.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/ngos/register', registerNGO);


router.post('/missions', verifyToken, verifyRole(['ngo']), createMedicalMission);

router.post('/missions/schedule/request', verifyToken, verifyRole(['ngo']), requestMissionSchedule);

router.get('/ngos', getVerifiedNGOs);
router.get('/missions', getMedicalMissions);
router.post('/missions/schedule/offer', verifyToken, verifyRole(['doctor']), offerDoctorAvailability);
router.post('/missions/:mission_id/notify', verifyToken, verifyRole(['ngo']), createMissionNotification);
router.get('/missions/:mission_id/notifications', getMissionNotifications);
export default router;