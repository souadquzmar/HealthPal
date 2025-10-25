import db from "../config/database.js";

export const getAllInventory = (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addInventoryItem = (req, res) => {
  const { item_name, category, quantity, donor_name, contact_info } = req.body;
  const sql = `
    INSERT INTO inventory (item_name, category, quantity, donor_name, contact_info)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [item_name, category, quantity, donor_name, contact_info], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Inventory item added successfully", id: result.insertId });
  });
};

export const updateInventoryStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // available/reserved/delivered
  const sql = "UPDATE inventory SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inventory status updated successfully" });
  });
};
