import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// جلب جميع NGOs الموثوقة
export const getVerifiedNGOs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, organization_name, description, website, contact_email, contact_phone, verified 
      FROM ngo_partners
      WHERE verified = TRUE
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching NGOs', error: error.message });
  }
};

export const registerNGO = async (req, res) => {
  const { fullName, email, password, organization_name, description, website, contact_email, contact_phone } = req.body;

  if (!fullName || !email || !password || !organization_name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role, is_verified) VALUES (?,?,?,?,?)',
      [fullName, email, hashedPassword, 'ngo', 1] 
    );
    const userId = userResult.insertId;

    const [ngoResult] = await db.query(
      `INSERT INTO ngo_partners 
       (user_id, organization_name, description, website, contact_email, contact_phone, verified)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [userId, organization_name, description, website, contact_email, contact_phone]
    );

    res.status(201).json({
      message: 'NGO registered successfully',
      ngo_id: ngoResult.insertId,
      user_id: userId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createMedicalMission = async (req, res) => {
    const { title, description, location, start_date, end_date, type } = req.body;
    const ngo_id = req.user.ngoPartnerId;

    if (!ngo_id) {
        return res.status(400).json({ message: 'Cannot create mission: NGO not found' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO medical_missions 
             (ngo_id, title, description, location, start_date, end_date, type, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [ngo_id, title, description, location, start_date, end_date, type, req.user.id]
        );
        res.status(201).json({ mission_id: result.insertId, message: 'Mission created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating mission', error: error.message });
    }
};


export const getMedicalMissions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT mm.*, np.organization_name 
      FROM medical_missions mm 
      JOIN ngo_partners np ON mm.ngo_id = np.id
      ORDER BY mm.start_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching missions', error: error.message });
  }
};

export const requestMissionSchedule = async (req, res) => {
  const { mission_id, scheduled_at, notes } = req.body;
  const patient_id = req.user.patientId;

  try {
    const [result] = await db.query(
      `INSERT INTO mission_schedules 
       (mission_id, patient_id, scheduled_at, notes, status)
       VALUES (?, ?, ?, ?, 'requested')`,
      [mission_id, patient_id, scheduled_at, notes]
    );
    res.status(201).json({ schedule_id: result.insertId, message: 'Request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting schedule', error: error.message });
  }
};

export const offerDoctorAvailability = async (req, res) => {
  const { mission_id, scheduled_at } = req.body;
  const doctor_id = req.user.doctorId;

  try {
    const [result] = await db.query(
      `INSERT INTO mission_schedules 
       (mission_id, doctor_id, scheduled_at, status)
       VALUES (?, ?, ?, 'available')`,
      [mission_id, doctor_id, scheduled_at]
    );
    res.status(201).json({ schedule_id: result.insertId, message: 'Availability offered' });
  } catch (error) {
    res.status(500).json({ message: 'Error offering availability', error: error.message });
  }
};

export const createMissionNotification = async (req, res) => {
  const { mission_id, message, community_id } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO mission_notifications (mission_id, community_id, message)
       VALUES (?, ?, ?)`,
      [mission_id, community_id || null, message]
    );
    res.status(201).json({ notification_id: result.insertId, message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

export const getMissionNotifications = async (req, res) => {
  const { mission_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT * FROM mission_notifications 
      WHERE mission_id = ?
      ORDER BY sent_at DESC
    `, [mission_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};
