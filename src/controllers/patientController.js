import db from "../config/database.js";

export const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const [[patient]] = await db.query(
      `
      SELECT 
        u.full_name, 
        u.email, 
        p.gender, 
        p.date_of_birth, 
        p.medical_history
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `,
      [patientId]
    );

    if (!patient)
      return res.status(404).json({ message: "Patient not found." });

    const [cases] = await db.query(
      `
      SELECT id, title, description, category, location, goal_amount, amount_raised, status, created_at
      FROM cases
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      patient,
      cases,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
