import db from '../config/database.js';

export const getAllCounselors = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.user_id, u.full_name, c.specialty, c.description, c.available, c.created_at
       FROM counselors c
       JOIN users u ON c.user_id = u.id
       WHERE c.available = TRUE`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCounselor = async (req, res) => {
  try {
    const { user_id, specialty, description } = req.body;
    if (!user_id || !specialty) return res.status(400).json({ message: 'user_id and specialty required' });

    const [result] = await db.query(
      'INSERT INTO counselors (user_id, specialty, description) VALUES (?, ?, ?)',
      [user_id, specialty, description || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Counselor created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const scheduleSession = async (req, res) => {
  try {
    const { counselor_id, scheduled_at } = req.body;
    if (!counselor_id || !scheduled_at) return res.status(400).json({ message: 'counselor_id and scheduled_at required' });

    const userId = req.user.id;
    const [patientRows] = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (patientRows.length === 0) return res.status(400).json({ message: 'Patient profile not found. Create patient profile first.' });
    const patient_id = patientRows[0].id;

    const [result] = await db.query(
      'INSERT INTO counseling_sessions (counselor_id, patient_id, scheduled_at) VALUES (?, ?, ?)',
      [counselor_id, patient_id, scheduled_at]
    );
    res.status(201).json({ id: result.insertId, message: 'Session scheduled (pending)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ message: 'status required' });

    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      await db.query('UPDATE counseling_sessions SET status = ?, notes = ? WHERE id = ?', [status, notes || null, sessionId]);
      return res.json({ message: 'Session updated by admin' });
    }
    const [counRows] = await db.query('SELECT id FROM counselors WHERE user_id = ?', [userId]);
    if (counRows.length === 0) return res.status(403).json({ message: 'Not authorized' });
    const counselorId = counRows[0].id;

    const [sessRows] = await db.query('SELECT * FROM counseling_sessions WHERE id = ? AND counselor_id = ?', [sessionId, counselorId]);
    if (sessRows.length === 0) return res.status(403).json({ message: 'Session not found or not yours' });

    await db.query('UPDATE counseling_sessions SET status = ?, notes = ? WHERE id = ?', [status, notes || null, sessionId]);
    res.json({ message: 'Session updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
