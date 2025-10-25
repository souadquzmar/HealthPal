import express from "express";
import {
  getAllEquipment,
  addEquipment,
  updateEquipmentAvailability,
} from "../controllers/equipmentController.js";

const router = express.Router();

router.get("/", getAllEquipment);
router.post("/", addEquipment);
router.put("/:id", updateEquipmentAvailability);

export default router;
