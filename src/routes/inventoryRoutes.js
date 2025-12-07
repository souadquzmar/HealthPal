import express from "express";
import {
  getAllEquipment,
  addEquipment,
  updateEquipmentAvailability,
} from "../controllers/equipmentController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllEquipment);
router.post("/", verifyToken, verifyRole(['ngo', 'admin']), addEquipment);
router.put("/:id", verifyToken, verifyRole(['ngo', 'admin']), updateEquipmentAvailability);

export default router;
