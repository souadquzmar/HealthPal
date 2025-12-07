import db from "../config/database.js";

// CREATE WORKSHOP
const createWorkshop = async (req, res) => {
    const { title, description, date, location, type, link } = req.body;
    const sql = `
        INSERT INTO workshops (title, description, date, location, type, link)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result] = await db.query(sql, [title, description, date, location, type || "onsite", link || null]);
        res.json({ message: "Workshop created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ALL WORKSHOPS
const getWorkshops = async (req, res) => {
    const sql = "SELECT * FROM workshops ORDER BY date DESC";
    try {
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ONE WORKSHOP
const getWorkshop = async (req, res) => {
    const sql = "SELECT * FROM workshops WHERE id = ?";
    try {
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: true, message: "Workshop not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
    }
};

// UPDATE WORKSHOP
const updateWorkshop = async (req, res) => {
    const { title, description, date, location, type, link } = req.body;
    const sql = `
        UPDATE workshops
        SET title=?, description=?, date=?, location=?, type=?, link=?
        WHERE id=?
    `;
    try {
        await db.query(sql, [title, description, date, location, type, link, req.params.id]);
        res.json({ message: "Workshop updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
    }
};

// DELETE WORKSHOP
const deleteWorkshop = async (req, res) => {
    const sql = "DELETE FROM workshops WHERE id=?";
    try {
        await db.query(sql, [req.params.id]);
        res.json({ message: "Workshop deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
    }
};

export default {
    createWorkshop,
    getWorkshops,
    getWorkshop,
    updateWorkshop,
    deleteWorkshop
};
