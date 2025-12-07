import express from "express";
import {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
} from "../controllers/healthAlertController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createAlert);
router.get("/alerts", getAlerts);
router.get("/:id", getAlert);
router.put("/:id", verifyToken, verifyAdmin, updateAlert);
router.delete("/:id", verifyToken, verifyAdmin, deleteAlert);

export default router;
