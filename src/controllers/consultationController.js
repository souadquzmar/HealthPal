import db from "../config/database.js";

export const bookConsultation = async (req, res) => {
  try {
    const { patient_id, doctor_id, scheduled_at, notes } = req.body;

    if (!patient_id || !doctor_id || !scheduled_at)
      return res
        .status(400)
        .json({
          message: "Patient Id, Doctor Id and appointment time are required",
        });

    const [doctor] = await db.query(
      `SELECT u.id, u.is_verified 
       FROM users u 
       JOIN doctors d ON u.id = d.user_id 
       WHERE d.id  = ? AND u.role = 'doctor'`,
      [doctor_id]
    );

    if(doctor.length === 0)
        return res.status(404).json({message: ' Doctor not found.'});

    if(!doctor[0].is_verified)
        return res.status(403).json({message: 'Doctor is not verified yet.'});

    const [existingAppointment] = await db.query(`select * from appointments where doctor_id = ? and scheduled_at = ? and status in ('pending','confirmed')`,[doctor_id,scheduled_at]);
    const [result] = await db.query(
      "insert into appointments (patient_id, doctor_id , scheduled_at, notes) values (?,?,?,?)",
      [patient_id, doctor_id, scheduled_at, notes || null]
    );

    if(existingAppointment.length > 0)
        return res.status(409).json({message: 'Doctor is already booked for this time. Please choose another time.'});
    return res.status(201).json({
      message: "Consultation booked successfully.",
      appointment: {
        id: result.insertId,
        patient_id,
        doctor_id,
        scheduled_at,
        status: "pending",
        notes: notes || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
