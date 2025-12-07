import db from "../config/database.js";

// Get all medicine requests
export const getAllMedicines = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM medicines");
    res.json({ success: true, medicines: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add new medicine request
export const addMedicineRequest = async (req, res) => {
  const { name, description, quantity, requester_name, requester_contact } = req.body;
  const sql = `
    INSERT INTO medicines (name, description, quantity, requester_name, requester_contact)
    VALUES (?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await db.query(sql, [name, description, quantity, requester_name, requester_contact]);
    res.status(201).json({ message: "Medicine request created successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update medicine status (fulfilled by NGO/volunteer)
export const updateMedicineStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'in_progress' or 'fulfilled'
  const sql = "UPDATE medicines SET status = ? WHERE id = ?";
  try {
    await db.query(sql, [status, id]);
    res.json({ message: "Medicine status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
