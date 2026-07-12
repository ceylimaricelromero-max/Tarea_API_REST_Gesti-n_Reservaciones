// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato Bearer TOKEN

    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "El token ha expirado, por favor inicia sesión de nuevo" });
            }
            return res.status(403).json({ message: "Token inválido o alterado" });
        }
        req.user = user; // Almacenamos el payload decodificado (id, rol)
        next();
    });
};