import express from "express";
import guideController from "../controllers/guideController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, guideController.createGuide);
router.get("/", guideController.getGuides);
router.get("/:id", guideController.getGuide);
router.put("/:id", verifyToken, verifyAdmin, guideController.updateGuide);
router.delete("/:id", verifyToken, verifyAdmin, guideController.deleteGuide);

export default router;
