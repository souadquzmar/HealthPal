import express from "express";
import {
  getAllMedicines,
  addMedicineRequest,
  updateMedicineStatus,
} from "../controllers/medicineController.js";
import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllMedicines);
router.post("/", verifyToken, verifyRole(['patient', 'doctor']), addMedicineRequest);
router.put("/:id", verifyToken, verifyRole(['ngo', 'admin']), updateMedicineStatus);

export default router;
