import express from "express";
import guideController from "../controllers/guideController.js";

const router = express.Router();

router.post("/", guideController.createGuide);
router.get("/", guideController.getGuides);
router.get("/:id", guideController.getGuide);
router.put("/:id", guideController.updateGuide);
router.delete("/:id", guideController.deleteGuide);

export default router;
