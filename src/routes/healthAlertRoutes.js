import express from "express";
import healthAlertsController from "../controllers/healthAlertsController.js";

const router = express.Router();

router.post("/", healthAlertsController.createAlert);
router.get("/", healthAlertsController.getAlerts);
router.get("/:id", healthAlertsController.getAlert);
router.put("/:id", healthAlertsController.updateAlert);
router.delete("/:id", healthAlertsController.deleteAlert);

export default router;
