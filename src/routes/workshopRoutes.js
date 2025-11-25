import express from "express";
import workshopController from "../controllers/workshopController.js";

const router = express.Router();

router.post("/", workshopController.createWorkshop);
router.get("/", workshopController.getWorkshops);
router.get("/:id", workshopController.getWorkshop);
router.put("/:id", workshopController.updateWorkshop);
router.delete("/:id", workshopController.deleteWorkshop);

export default router;
