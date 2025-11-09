import db from '../config/database.js';

export const getCounselors= async (req, res) => {
  try{
   const [rows] = await db.query(`
      SELECT c.id, u.full_name, c.specialty, c.description, c.available
      FROM counselors c
      JOIN users u ON c.user_id = u.id
      WHERE c.available = TRUE
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch counselors', error: error.message });
  }
};

export const bookCounselingSession = async (req, res) => {
  const { counselor_id, scheduled_at } = req.body;
  const userId = req.user.id;

  try {
    
    const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (patient.length === 0) return res.status(404).json({ message: 'Patient not found' });

    const patient_id = patient[0].id;

    const [result] = await db.query(
      `INSERT INTO counseling_sessions (counselor_id, patient_id, scheduled_at)
       VALUES (?, ?, ?)`,
      [counselor_id, patient_id, scheduled_at]
    );

    res.status(201).json({
      session_id: result.insertId,
      message: 'Session booked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
};

export const createSupportGroup = async (req, res) => {
  const { name, description } = req.body;
  const created_by = req.user.id;

  try {
    const [result] = await db.query(
      `INSERT INTO support_groups (name, description, created_by, moderator_id)
       VALUES (?, ?, ?, ?)`,
      [name, description, created_by, created_by]
    );

    res.status(201).json({
      group_id: result.insertId,
      message: 'Support group created'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

export const getSupportGroups = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sg.id, sg.name, sg.description, sg.created_at, u.full_name AS creator
      FROM support_groups sg
      JOIN users u ON sg.created_by = u.id
      ORDER BY sg.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

export const createGroupPost = async (req, res) => {
  const { group_id, content } = req.body;
  const user_id = req.user.id;

  try {
    const [result] = await db.query(
      `INSERT INTO group_posts (group_id, user_id, content) VALUES (?, ?, ?)`,
      [group_id, user_id, content]
    );
    res.status(201).json({ post_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Post failed', error: error.message });
  }
};

export const getGroupPosts = async (req, res) => {
  const { group_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT gp.id, gp.content, gp.created_at, u.full_name, u.role
      FROM group_posts gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.group_id = ? AND gp.removed = FALSE
      ORDER BY gp.created_at DESC
    `, [group_id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

export const startAnonymousTherapy = async (req, res) => {
  const { counselor_id } = req.body;
  const userId = req.user.id;

  try {
    const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (patient.length === 0) return res.status(404).json({ message: 'Patient not found' });

    const patient_id = patient[0].id;

    const [result] = await db.query(
      `INSERT INTO therapy_sessions (counselor_id, patient_id, is_anonymous)
       VALUES (?, ?, TRUE)`,
      [counselor_id, patient_id]
    );

    res.status(201).json({ session_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start session', error: error.message });
  }
};

export const sendTherapyMessage = async (req, res) => {
  const { session_id, message } = req.body;
  const sender_role = req.user.role === 'patient' ? 'patient' : 'counselor';

  try {
    await db.query(
      `INSERT INTO therapy_messages (session_id, sender_role, message)
       VALUES (?, ?, ?)`,
      [session_id, sender_role, message]
    );

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ message: 'Send failed', error: error.message });
  }
};
export const getTherapyMessages = async (req, res) => {
  const { session_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id, sender_role, message, sent_at
       FROM therapy_messages
       WHERE session_id = ?
       ORDER BY sent_at ASC`,
      [session_id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};