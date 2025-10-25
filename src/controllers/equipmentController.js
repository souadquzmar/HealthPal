import db from "../config/database.js";

// Get all equipment
export const getAllEquipment = (req, res) => {
  db.query("SELECT * FROM equipment", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Add new equipment
export const addEquipment = (req, res) => {
  const { name, type, location, provider_name, contact_info } = req.body;
  const sql = `
    INSERT INTO equipment (name, type, location, provider_name, contact_info)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, type, location, provider_name, contact_info], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Equipment added successfully", id: result.insertId });
  });
};

// Update availability (for example, when reserved/delivered)
export const updateEquipmentAvailability = (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  const sql = "UPDATE equipment SET available = ? WHERE id = ?";
  db.query(sql, [available, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Equipment availability updated" });
  });
};
