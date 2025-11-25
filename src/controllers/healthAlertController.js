import db from "../config/database.js";

// CREATE
const createAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO health_alerts (title, description, severity, is_active, closed_at) VALUES (?,?,?,?,?)",
            [title, description, severity, is_active, closed_at]
        );
        res.json({ message: "Alert created", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL
const getAlerts = async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM health_alerts");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ONE
const getAlert = async (req, res) => {
    try {
        const [result] = await db.execute(
            "SELECT * FROM health_alerts WHERE id=?",
            [req.params.id]
        );
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const updateAlert = async (req, res) => {
    const { title, description, severity, is_active, closed_at } = req.body;
    try {
        await db.execute(
            "UPDATE health_alerts SET title=?, description=?, severity=?, is_active=?, closed_at=? WHERE id=?",
            [title, description, severity, is_active, closed_at, req.params.id]
        );
        res.json({ message: "Alert updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
const deleteAlert = async (req, res) => {
    try {
        await db.execute("DELETE FROM health_alerts WHERE id=?", [req.params.id]);
        res.json({ message: "Alert deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    createAlert,
    getAlerts,
    getAlert,
    updateAlert,
    deleteAlert
};
