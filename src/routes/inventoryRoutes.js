import express from "express";
import {
  getAllInventory,
  addInventoryItem,
  updateInventoryStatus,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getAllInventory);
router.post("/", addInventoryItem);
router.put("/:id", updateInventoryStatus);

export default router;
