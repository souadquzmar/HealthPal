import pool from '../config/database.js';

export const createAlert = async (req, res) => {
  try {
    const { title, message, category, priority } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO health_alerts (title, message, category, priority, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [title, message, category, priority || 'medium']
    );

    res.status(201).json({
      alert_id: result.insertId,
      message: 'Health alert created successfully'
    });
  } catch (error) {
    console.error('Create Alert Error:', error);
    res.status(500).json({ message: 'Error creating alert' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const [alerts] = await pool.query(
      `SELECT * FROM health_alerts WHERE is_active = 1 ORDER BY created_at DESC`
    );

    res.status(200).json({
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Get Alerts Error:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

export const getAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const [alerts] = await pool.query(
      `SELECT * FROM health_alerts WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json(alerts[0]);
  } catch (error) {
    console.error('Get Alert Error:', error);
    res.status(500).json({ message: 'Error fetching alert' });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, category, priority, is_active } = req.body;

    const [result] = await pool.query(
      `UPDATE health_alerts 
       SET title = ?, message = ?, category = ?, priority = ?, is_active = ?
       WHERE id = ?`,
      [title, message, category, priority, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json({ message: 'Alert updated successfully' });
  } catch (error) {
    console.error('Update Alert Error:', error);
    res.status(500).json({ message: 'Error updating alert' });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      `UPDATE health_alerts SET is_active = 0 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete Alert Error:', error);
    res.status(500).json({ message: 'Error deleting alert' });
  }
};

export default {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert
};