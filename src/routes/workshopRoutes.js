import express from "express";
import workshopController from "../controllers/workshopController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, workshopController.createWorkshop);
router.get("/", workshopController.getWorkshops);
router.get("/:id", workshopController.getWorkshop);
router.put("/:id", verifyToken, verifyAdmin, workshopController.updateWorkshop);
router.delete("/:id", verifyToken, verifyAdmin, workshopController.deleteWorkshop);

export default router;
