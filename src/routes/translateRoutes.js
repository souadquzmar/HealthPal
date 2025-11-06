import express from "express";
import { translateText } from "../controllers/translateController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/translate", verifyToken, translateText);

export default router;
