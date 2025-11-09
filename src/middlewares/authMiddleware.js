import jwt from 'jsonwebtoken'
import db from '../config/database.js';

export const verifyToken = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer'))
        return res.status(401).json({message: 'Access denied'});

    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;

        if (decoded.role === 'ngo') {
      const [ngo] = await db.query('SELECT id FROM ngo_partners WHERE user_id = ?', [decoded.id]);
      req.user.ngoPartnerId = ngo[0]?.id;
    }

    if (decoded.role === 'patient') {
      const [patient] = await db.query('SELECT id FROM patients WHERE user_id = ?', [decoded.id]);
      req.user.patientId = patient[0]?.id;
    }
    if (decoded.role === 'doctor') {
      const [doctor] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [decoded.id]);
      req.user.doctorId = doctor[0]?.id;
    }
        next();
    } catch(error){
        return res.status(403).json({message: 'Invalid or expired token'});
    }
}

export const verifyRole = (roles) => (req,res,next) => {
    if(!roles.includes(req.user.role))
        return res.status(403).json({message: 'Access denied'});
    next();
}

export const verifyAdmin = (req,res,next) => {
    if(req.user && req.user.role === 'admin')
        next();
    else
        return res.status(403).json({message: 'Access denied: Admins only'});
}