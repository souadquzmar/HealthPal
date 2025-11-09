import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import dotenv from 'dotenv';
import { registerSchema, loginSchema } from '../validations/authSchema.js';
dotenv.config();

export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    // Patient fields
    gender,
    date_of_birth,
    medical_history,
    // Doctor fields
    specialty,
    license_number,
    // Counselor fields
    counselor_specialty,
    description,
    available,
    // NGO fields
    organization_name,
    ngo_description
  } = req.body;

  let connection;

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isVerified = role === 'doctor' ? 0 : 1;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, role, is_verified) VALUES (?,?,?,?,?)',
      [fullName, email, hashedPassword, role, isVerified]
    );
    const userId = userResult.insertId;

    switch (role) {
      case 'patient':
        await connection.query(
          'INSERT INTO patients (user_id, gender, date_of_birth, medical_history) VALUES (?,?,?,?)',
          [userId, gender, date_of_birth, medical_history]
        );
        break;

      case 'counselor':
        await connection.query(
          'INSERT INTO counselors (user_id, specialty, description, available) VALUES (?,?,?,?)',
          [userId, counselor_specialty || 'general', description, available !== undefined ? available : 1]
        );
        break;

      case 'ngo':
        if (!organization_name) throw new Error('Organization name is required for NGO registration');
        await connection.query(
          'INSERT INTO ngos (user_id, organization_name, description) VALUES (?,?,?)',
          [userId, organization_name, ngo_description]
        );
        break;

      default:
        break;
    }

    await connection.commit();
    connection.release();

    const msg =
      role === 'doctor'
        ? 'Doctor registered successfully. Your account is pending verification by an admin.'
        : 'User registered successfully';

    const token = jwt.sign(
      { id: userId, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: msg,
      token,
      user: {
        id: userId,
        full_name: fullName,
        role: role
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Password is wrong' });

    if (user.role === 'doctor' && !user.is_verified)
      return res.status(403).json({ message: 'Your account is pending verification by an admin.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Login successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
