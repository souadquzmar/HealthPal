import express from "express";
import {
  getAllMedicines,
  addMedicineRequest,
  updateMedicineStatus,
} from "../controllers/medicineController.js";

const router = express.Router();

router.get("/", getAllMedicines);
router.post("/", addMedicineRequest);
router.put("/:id", updateMedicineStatus);

export default router;
