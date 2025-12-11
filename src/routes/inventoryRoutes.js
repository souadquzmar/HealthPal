import express from "express";
import {
  getAllInventory,
  addInventoryItem,
  updateInventoryStatus,
} from "../controllers/inventoryController.js";

import { verifyToken, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllInventory);

// ADD — NGO + ADMIN ONLY
router.post(
  "/",
  verifyToken,
  verifyRole(["ngo", "admin"]),
  addInventoryItem
);

// UPDATE STATUS — NGO + ADMIN ONLY
router.put(
  "/:id/status",
  verifyToken,
  verifyRole(["ngo", "admin"]),
  updateInventoryStatus
);

export default router;
