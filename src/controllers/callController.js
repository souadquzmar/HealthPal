import db from "../config/database.js";

export const startCall = async (req, res) => {
  try {
    const { consultation_id } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!consultation_id)
      return res.status(400).json({ message: "Consultation ID is required." });

    // Check consultation existence
    const [consultations] = await db.query(
      `SELECT a.id, a.doctor_id, a.patient_id, 
              p.user_id AS patient_user_id, 
              d.user_id AS doctor_user_id
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [consultation_id]
    );

    if (consultations.length === 0)
      return res.status(404).json({ message: "Consultation not found." });

    const consultation = consultations[0];

    // Check user authorization
    if (userId !== consultation.patient_user_id && 
        userId !== consultation.doctor_user_id) {
      return res.status(403).json({ message: "You are not part of this consultation." });
    }

    // Check if an active call already exists
    const [activeCalls] = await db.query(
      `SELECT * FROM consultation_calls 
       WHERE consultation_id = ? AND status = "active"`,
      [consultation_id]
    );

    if (activeCalls.length > 0)
      return res
        .status(400)
        .json({ message: "There is already an active call for this consultation." });

    // Start new call
    const [result] = await db.query(
      `INSERT INTO consultation_calls 
       (consultation_id, started_by, status, started_at) 
       VALUES (?, ?, "active", NOW())`,
      [consultation_id, userRole]
    );

    // Get actual DB timestamps
    const [newCall] = await db.query(
      `SELECT * FROM consultation_calls WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: "Call started successfully.",
      data: newCall[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const endCall = async (req, res) => {
  try {
    const consultation_id = req.params.id;
    const userId = req.user.id;

    // Find the active call for this consultation
    const [calls] = await db.query(
      `SELECT c.*, a.id AS consultation_id,
              d.user_id AS doctor_user_id,
              p.user_id AS patient_user_id
       FROM consultation_calls c
       JOIN appointments a ON c.consultation_id = a.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN patients p ON a.patient_id = p.id
       WHERE c.consultation_id = ? AND c.status = "active"`,
      [consultation_id]
    );

    if (calls.length === 0)
      return res.status(404).json({ message: "No active call found for this consultation." });

    const call = calls[0];

    // Authorization check
    if (userId !== call.patient_user_id && 
        userId !== call.doctor_user_id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // End the active call
    await db.query(
      `UPDATE consultation_calls 
       SET status = "ended", ended_at = NOW() 
       WHERE id = ?`,
      [call.id]
    );

    // Return updated data
    const [updated] = await db.query(
      `SELECT * FROM consultation_calls WHERE id = ?`,
      [call.id]
    );

    return res.status(200).json({
      message: "Call ended successfully.",
      data: updated[0],
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
