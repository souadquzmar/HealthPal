import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer'))
        return res.status(401).json({message: 'Access denied'});

    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error){
        return res.status(403).json({message: 'Invalid or expired token'});
    }
}

export const verifyRole = (roles) => (req,res,next) => {
    if(!roles.include(req.user.role))
        return res.status(403).json({message: 'Access denied'});
    next();
}