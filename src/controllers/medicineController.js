import db from "../config/database.js";

// Get all medicine requests
export const getAllMedicines = (req, res) => {
  db.query("SELECT * FROM medicines", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Add new medicine request
export const addMedicineRequest = (req, res) => {
  const { name, description, quantity, requester_name, requester_contact } = req.body;
  const sql = `
    INSERT INTO medicines (name, description, quantity, requester_name, requester_contact)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [name, description, quantity, requester_name, requester_contact], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Medicine request created successfully", id: result.insertId });
  });
};

// Update medicine status (fulfilled by NGO/volunteer)
export const updateMedicineStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'in_progress' or 'fulfilled'
  const sql = "UPDATE medicines SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medicine status updated successfully" });
  });
};
