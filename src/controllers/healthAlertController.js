import db from "../config/database.js";

// CREATE ALERT
export const createAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;
    try {
        const [result] = await db.execute(
            `INSERT INTO health_alerts (title, description, severity, is_active, closed_at) VALUES (?,?,?,?,?)`,
            [title, description, severity || "low", is_active !== undefined ? is_active : true, closed_at || null]
        );
        res.json({ message: "Alert created", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ALL ALERTS
export const getAlerts = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM health_alerts ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ONE ALERT
export const getAlert = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM health_alerts WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: true, message: "Alert not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// UPDATE ALERT
export const updateAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;
    try {
        await db.execute(
            "UPDATE health_alerts SET title=?, description=?, severity=?, is_active=?, closed_at=? WHERE id=?",
            [title, description, severity, is_active, closed_at, req.params.id]
        );
        res.json({ message: "Alert updated" });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// DELETE ALERT
export const deleteAlert = async (req, res) => {
    try {
        await db.execute("DELETE FROM health_alerts WHERE id=?", [req.params.id]);
        res.json({ message: "Alert deleted" });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};
