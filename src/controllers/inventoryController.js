import db from "../config/database.js";

// GET ALL INVENTORY
export const getAllInventory = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM inventory ORDER BY created_at DESC");
    res.json({ success: true, count: rows.length, items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error." });
  }
};

// ADD INVENTORY ITEM
export const addInventoryItem = async (req, res) => {
  const { item_name, category, quantity, donor_name, contact_info } = req.body;

  if (!item_name || !quantity) {
    return res.status(400).json({ error: true, message: "Item name and quantity are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO inventory (item_name, category, quantity, donor_name, contact_info) VALUES (?, ?, ?, ?, ?)",
      [item_name, category || "medicine", quantity, donor_name || null, contact_info || null]
    );

    res.status(201).json({ message: "Inventory item added successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error." });
  }
};

// UPDATE INVENTORY STATUS
export const updateInventoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM inventory WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: "Inventory item not found" });
    }

    await db.query("UPDATE inventory SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Inventory status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error." });
  }
};
