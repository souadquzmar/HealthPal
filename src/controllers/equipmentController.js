import db from "../config/database.js";

// Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM equipment");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new equipment
export const addEquipment = async (req, res) => {
  try {
    const { name, type, location, provider_name, contact_info } = req.body;
    const sql = `
      INSERT INTO equipment (name, type, location, provider_name, contact_info)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, type, location, provider_name, contact_info]);
    res.status(201).json({ message: "Equipment added successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update availability
export const updateEquipmentAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const sql = "UPDATE equipment SET available = ? WHERE id = ?";
    await db.query(sql, [available, id]);
    res.json({ message: "Equipment availability updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
