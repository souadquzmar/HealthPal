import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      'SELECT id, fullName, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: "Auth route is working!" });
});
export default router;