import pool from '../config/database.js';

export const getCounselors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, u.full_name, c.specialty, c.description, c.available
      FROM counselors c
      JOIN users u ON c.user_id = u.id
      WHERE c.available = TRUE
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bookCounselingSession = async (req, res) => {
  const { counselor_id, scheduled_at, notes } = req.body;
  const patient_id = req.user.patient_id;

  try {
    const [result] = await pool.query(
      `INSERT INTO counseling_sessions 
       (counselor_id, patient_id, scheduled_at, notes) 
       VALUES (?, ?, ?, ?)`,
      [counselor_id, patient_id, scheduled_at, notes || null]
    );
    res.status(201).json({ sessionId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyCounselingSessions = async (req, res) => {
  const patient_id = req.user.patient_id;
  try {
    const [rows] = await pool.query(`
      SELECT cs.*, u.full_name AS counselor_name, c.specialty
      FROM counseling_sessions cs
      JOIN counselors c ON cs.counselor_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE cs.patient_id = ?
      ORDER BY cs.scheduled_at DESC
    `, [patient_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSupportGroups = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sg.*, u.full_name AS creator_name, m.full_name AS moderator_name
      FROM support_groups sg
      LEFT JOIN users u ON sg.created_by = u.id
      LEFT JOIN users m ON sg.moderator_id = m.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSupportGroup = async (req, res) => {
  const { name, description, moderator_id } = req.body;
  const created_by = req.user.id;

  try {
    const [result] = await pool.query(
      `INSERT INTO support_groups (name, description, created_by, moderator_id)
       VALUES (?, ?, ?, ?)`,
      [name, description, created_by, moderator_id || null]
    );
    res.status(201).json({ groupId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroupPosts = async (req, res) => {
  const { groupId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT gp.*, u.full_name AS author
      FROM group_posts gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.group_id = ? AND gp.removed = FALSE
      ORDER BY gp.created_at DESC
    `, [groupId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postInGroup = async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  try {
    await pool.query(
      `INSERT INTO group_posts (group_id, user_id, content) VALUES (?, ?, ?)`,
      [groupId, user_id, content]
    );
    res.status(201).json({ message: 'Post added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGroupPost = async (req, res) => {
  const { groupId, postId } = req.params;
  const userId = req.user.id;

  try {
    const [group] = await pool.query(
      `SELECT moderator_id FROM support_groups WHERE id = ?`, [groupId]
    );
    if (!group[0] || group[0].moderator_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query(`UPDATE group_posts SET removed = TRUE WHERE id = ?`, [postId]);
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const startTherapySession = async (req, res) => {
  const { counselor_id, is_anonymous = true } = req.body;
  const patient_id = req.user?.patient_id || null;

  try {
    const [result] = await pool.query(
      `INSERT INTO therapy_sessions (counselor_id, patient_id, is_anonymous)
       VALUES (?, ?, ?)`,
      [counselor_id, patient_id, is_anonymous]
    );
    res.json({ sessionId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendTherapyMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  const sender_role = req.user.role === 'doctor' ? 'counselor' : 'patient';

  try {
    await pool.query(
      `INSERT INTO therapy_messages (session_id, sender_role, message)
       VALUES (?, ?, ?)`,
      [sessionId, sender_role, message]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTherapyMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT * FROM therapy_messages
      WHERE session_id = ?
      ORDER BY sent_at ASC
    `, [sessionId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const endTherapySession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await pool.query(`UPDATE therapy_sessions SET status = 'ended' WHERE id = ?`, [sessionId]);
    res.json({ message: 'Session ended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};