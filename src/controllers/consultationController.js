import db from "../config/database.js";

export const bookConsultation = async (req, res) => {
  try {
    const { patient_id, doctor_id, scheduled_at, notes } = req.body;

    if (!patient_id || !doctor_id || !scheduled_at)
      return res.status(400).json({
        message: "Patient Id, Doctor Id and appointment time are required",
      });

    const [doctor] = await db.query(
      `SELECT u.id, u.is_verified 
       FROM users u 
       JOIN doctors d ON u.id = d.user_id 
       WHERE d.id  = ? AND u.role = 'doctor'`,
      [doctor_id]
    );

    if (doctor.length === 0)
      return res.status(404).json({ message: " Doctor not found." });

    if (!doctor[0].is_verified)
      return res.status(403).json({ message: "Doctor is not verified yet." });

    const [existingAppointment] = await db.query(
      `select * from appointments where doctor_id = ? and scheduled_at = ? and status in ('pending','confirmed')`,
      [doctor_id, scheduled_at]
    );

    if (existingAppointment.length > 0)
      return res
        .status(409)
        .json({
          message:
            "Doctor is already booked for this time. Please choose another time.",
        });
    const [result] = await db.query(
      "insert into appointments (patient_id, doctor_id , scheduled_at, notes) values (?,?,?,?)",
      [patient_id, doctor_id, scheduled_at, notes || null]
    );
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

export const getPatientConsultations = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!patientId)
      return res.status(400).json({ message: "Patient ID is required." });

    const [consultations] = await db.query(
      `SELECT 
          a.id AS appointment_id,
          a.scheduled_at,
          a.status,
          a.notes,
          d.id AS doctor_id,
          u.full_name AS doctor_name,
          d.specialty
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = ?
       ORDER BY a.scheduled_at DESC`,
      [patientId]
    );

    if(consultations.length === 0)
      return res.status(404).json({message: 'No consultations found for this patient.'});

    return res.status(200).json({message:'Consultations retrieved successfully.',consultations});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getDoctorConsultations = async(req,res) => {
  try{

    const doctorId = req.params.id;
    if(!doctorId)
      return res.status(400).json({message: 'Doctor ID is required.'});

    const [consultations] = await db.query(
      `SELECT 
          a.id AS appointment_id,
          a.scheduled_at,
          a.status,
          a.notes,
          p.id AS patient_id,
          u.full_name AS patient_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.scheduled_at DESC`,
      [doctorId]
    );

    if(consultations.length === 0)
      return res.status(404).json({message: 'No consultations found for this doctor.'});

    return res.status(200).json({message: 'Consultations retrieved successfully.',consultations});
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export const updateConsultationStatus = async (req,res) => {
  try{

    const appointmentId = req.params.id;
    const {status} = req.body;
    const userId = req.user.id;

    const allowedStatuses = ['confirmed','cancelled','completed'];
    if(!allowedStatuses.includes(status))
      return res.status(400).json({message: 'Invalid status.'});

    const [appointments] = await db.query(
      `SELECT a.*, d.user_id AS doctor_user_id
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if(appointments.length === 0)
      return res.status(404).json({message:'Appointment not found.'});

    const appointment = appointments[0];

    if(req.user.role === 'doctor' && appointment.doctor_user_id !== userId)
      return res.status(403).json({message: 'Access denied. You are not assigned to this consultation.'});

    await db.query(`update appointments set status = ? where id = ?`,[status,appointmentId]);

    return res.status(200).json({
      message:`Consultation status updated to '${status}' successfully.`,
      appointment_id: appointmentId,
      new_status: status
    });

  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}