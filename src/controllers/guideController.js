import db from "../config/database.js";

// Create a new guide
export const createGuide = async (req, res) => {
    const { title, category, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: true, message: "Title and content are required." });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO health_guides (title, category, content) VALUES (?, ?, ?)",
            [title, category || null, content]
        );
        res.status(201).json({ message: "Guide created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// Get all guides
export const getGuides = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM health_guides ORDER BY id DESC");
        res.json({ success: true, count: rows.length, guides: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// Get guide by ID
export const getGuide = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM health_guides WHERE id = ?", [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: "Guide not found" });
        }

        res.json({ success: true, guide: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// Update a guide
export const updateGuide = async (req, res) => {
    const { title, category, content } = req.body;

    try {
        // Get existing guide
        const [existing] = await db.query("SELECT * FROM health_guides WHERE id = ?", [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: true, message: "Guide not found" });
        }

        const guide = existing[0];

        await db.query(
            "UPDATE health_guides SET title = ?, category = ?, content = ? WHERE id = ?",
            [title || guide.title, category || guide.category, content || guide.content, req.params.id]
        );

        res.json({ message: "Guide updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

// Delete a guide
export const deleteGuide = async (req, res) => {
    try {
        const [existing] = await db.query("SELECT * FROM health_guides WHERE id = ?", [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: true, message: "Guide not found" });
        }

        await db.query("DELETE FROM health_guides WHERE id = ?", [req.params.id]);
        res.json({ message: "Guide deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal server error." });
    }
};

export default {
    createGuide,
    getGuides,
    getGuide,
    updateGuide,
    deleteGuide
};
