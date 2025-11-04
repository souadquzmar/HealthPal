import db from "../config/database.js";

export const sendMessage = async (req, res) => {
  try {
    const { consultation_id, message } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!consultation_id || !message)
      return res
        .status(400)
        .json({ message: "consultation id and message are required." });

    const [consultations] = await db.query(
      `SELECT a.id, a.doctor_id, a.patient_id, p.user_id AS patient_user_id, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [consultation_id]
    );

    if(consultations.length === 0)
        return res.status(404).json({message: 'consultation does not exist.'});

    const consultation = consultations[0];

    const isParticipant = (userRole === 'doctor' && consultation.doctor_user_id === userId) || (userRole === 'patient' && consultation.patient_user_id === userId);

    if(!isParticipant)
        return res.status(403).json({message:'Access denied. you are not part of this consultation'});

    const [result] = await db.query('insert into consultation_messages (consultation_id, sender_role, message) values (?, ?, ?)',[consultation_id,userRole,message]);

    return res.status(201).json({
        message:'Message sent successfully.',
        data:{
            id: result.insertId,
            consultation_id,
            sender_role: userRole,
            message,
            sent_at: new Date()
        }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
