import db from "../config/database.js";

// CREATE WORKSHOP
const createWorkshop = async (req, res) => {
    const { title, description, date, location, type, link } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO workshops (title, description, date, location, type, link) VALUES (?,?,?,?,?,?)",
            [title, description, date, location, type || "onsite", link || null]
        );
        res.json({ message: "Workshop created", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ALL WORKSHOPS
const getWorkshops = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM workshops ORDER BY date DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// GET ONE WORKSHOP
const getWorkshop = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM workshops WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: true, message: "Workshop not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// UPDATE WORKSHOP
const updateWorkshop = async (req, res) => {
    const { title, description, date, location, type, link } = req.body;
    try {
        await db.execute(
            "UPDATE workshops SET title=?, description=?, date=?, location=?, type=?, link=? WHERE id=?",
            [title, description, date, location, type, link, req.params.id]
        );
        res.json({ message: "Workshop updated" });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

// DELETE WORKSHOP
const deleteWorkshop = async (req, res) => {
    try {
        await db.execute("DELETE FROM workshops WHERE id=?", [req.params.id]);
        res.json({ message: "Workshop deleted" });
    } catch (err) {
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
