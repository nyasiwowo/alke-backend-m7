const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ status: 'error', message: 'Se requiere un token de autenticación' });
    }

    try {

        const token = authHeader.split(' ')[1];
        
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        req.user = decoded; 
        
        
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;