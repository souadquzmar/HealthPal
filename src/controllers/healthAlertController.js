import db from "../config/database.js";

// CREATE ALERT
export const createAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: true, message: "Title and description are required." });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO health_alerts (title, description, severity, is_active, closed_at) VALUES (?, ?, ?, ?, ?)",
            [
                title,
                description,
                severity || "low",
                is_active !== undefined ? is_active : true,
                closed_at || null
            ]
        );

        res.status(201).json({ message: "Alert created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// GET ALL ALERTS
export const getAlerts = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM health_alerts ORDER BY created_at DESC");
        res.json({ success: true, count: rows.length, alerts: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// GET ONE ALERT
export const getAlert = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM health_alerts WHERE id = ?", [req.params.id]);
        if (rows.length === 0)
            return res.status(404).json({ error: true, message: "Alert not found" });

        res.json({ success: true, alert: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// UPDATE ALERT
export const updateAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;

    try {
        // Check if alert exists
        const [existing] = await db.query("SELECT * FROM health_alerts WHERE id = ?", [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: true, message: "Alert not found" });
        }

        const alert = existing[0];

        await db.query(
            "UPDATE health_alerts SET title = ?, description = ?, severity = ?, is_active = ?, closed_at = ? WHERE id = ?",
            [
                title || alert.title,
                description || alert.description,
                severity || alert.severity,
                is_active !== undefined ? is_active : alert.is_active,
                closed_at || alert.closed_at,
                req.params.id
            ]
        );

        res.json({ message: "Alert updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// DELETE ALERT
export const deleteAlert = async (req, res) => {
    try {
        const [existing] = await db.query("SELECT * FROM health_alerts WHERE id = ?", [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: true, message: "Alert not found" });
        }

        await db.query("DELETE FROM health_alerts WHERE id = ?", [req.params.id]);
        res.json({ message: "Alert deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

export default {
    createAlert,
    getAlerts,
    getAlert,
    updateAlert,
    deleteAlert
};
