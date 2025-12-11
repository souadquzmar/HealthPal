// authMiddleware.js
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;

        // NGO
        if (decoded.role === 'ngo') {
            const [ngo] = await pool.query(
                'SELECT id FROM ngo_partners WHERE user_id = ?', 
                [decoded.id]
            );
            if (!ngo[0]) {
                return res.status(400).json({ message: 'NGO profile not found for this user' });
            }
            req.user.ngoPartnerId = ngo[0].id;
        }

        // Patient
        if (decoded.role === 'patient') {
            const [patient] = await pool.query(
                'SELECT id FROM patients WHERE user_id = ?', 
                [decoded.id]
            );
            if (!patient[0]) {
                return res.status(404).json({ message: 'Patient profile not found' });
            }
            req.user.patientId = patient[0].id;
        }

        // Doctor
        if (decoded.role === 'doctor') {
            const [doctor] = await pool.query(
                'SELECT id FROM doctors WHERE user_id = ?', 
                [decoded.id]
            );
            if (!doctor[0]) {
                return res.status(404).json({ message: 'Doctor profile not found' });
            }
            req.user.doctorId = doctor[0].id;
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export const verifyRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
            message: `Access denied. Requires role: ${roles.join(', ')}` 
        });
    }
    next();
};

export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
};
