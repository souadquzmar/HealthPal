import db from "../config/database.js";

const createGuide = (req, res) => {
    const { title, category, content } = req.body;
    db.query(
        "INSERT INTO health_guides (title, category, content) VALUES (?,?,?)",
        [title, category, content],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Guide created", id: result.insertId });
        }
    );
};

const getGuides = (req, res) => {
    db.query("SELECT * FROM health_guides", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

const getGuide = (req, res) => {
    db.query("SELECT * FROM health_guides WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result[0]);
    });
};

const updateGuide = (req, res) => {
    const { title, category, content } = req.body;
    db.query(
        "UPDATE health_guides SET title=?, category=?, content=? WHERE id=?",
        [title, category, content, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Guide updated" });
        }
    );
};

const deleteGuide = (req, res) => {
    db.query("DELETE FROM health_guides WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Guide deleted" });
    });
};

export default {
    createGuide,
    getGuides,
    getGuide,
    updateGuide,
    deleteGuide
};
