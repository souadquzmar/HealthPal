import db from "../config/database.js";

export const startCall = async (req, res) => {
  try {
    const { consultation_id } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!consultation_id)
      return res.status(400).json({ message: "Consultation ID is required." });

    const [consultations] = await db.query(
      `SELECT a.id, a.doctor_id, a.patient_id, p.user_id AS patient_user_id, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [consultation_id]
    );

    if(consultations.length === 0)
        return res.status(404).json({message:'Consultation not found.'});

    const consultation = consultations[0];

    const isParticipant =
      (userRole === "doctor" && consultation.doctor_user_id === userId) ||
      (userRole === "patient" && consultation.patient_user_id === userId);

    if (!isParticipant)
      return res.status(403).json({message: "Access denied. you are not part of this consultation"});

    const [activeCalls] = await db.query(`select * from consultation_calls where consultation_id = ? and status = "active" `,[consultation_id]);

    if(activeCalls.length > 0)
        return res.status(400).json({message:'There is already an active call for this consultation.'});

    const [result] = await db.query('insert into consultation_calls (consultation_id,started_by) values (?,?)',[consultation_id,userRole]);

    return res.status(201).json({
        message:'Call started successfully.',
        data:{
            id: result.insertId,
            consultation_id,
            started_by: userRole,
            started_at: new Date(),
            status: 'active'
        }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const endCall = async (req, res) => {
  try {
    const id = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    const [calls] = await db.query(
      `SELECT c.*, a.id AS consultation_id, d.user_id AS doctor_user_id, p.user_id AS patient_user_id
       FROM consultation_calls c
       JOIN appointments a ON c.consultation_id = a.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN patients p ON a.patient_id = p.id
       WHERE c.id = ?`,
      [id]
    );

    if(calls.length === 0)
        return res.status(404).json({message:'There is no active call for this consultation.'});

    const call = calls[0];

    const isParticipant =
      (userRole === "doctor" && call.doctor_user_id === userId) ||
      (userRole === "patient" && call.patient_user_id === userId);

    if (!isParticipant)
      return res.status(403).json({message: "Access denied. you are not part of this consultation"});

    if(call.status === 'ended')
        return res.status(400).json({message:'This call is already ended.'});

    await db.query(`update consultation_calls set status = "ended", ended_at = NOW() where id = ?`,[id]);

    return res.status(200).json({
        message:'Call ended successfully.',
        data:{
            id: call.id,
            consultation_id: call.consultation_id,
            started_by: call.started_by,
            started_at: call.started_at,
            ended_at: new Date(),
            status: 'ended'
        }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};