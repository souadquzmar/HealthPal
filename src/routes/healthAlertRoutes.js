import express from "express";
import {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
} from "../controllers/healthAlertController.js";

const router = express.Router();

router.post("/", createAlert);
router.get("/alerts", getAlerts);
router.get("/:id", getAlert);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);

export default router;
