// middlewares/role.middleware.js
module.exports = (roleRequerido) => {
    return (req, res, next) => {
        if (!req.user || req.user.rol !== roleRequerido) {
            return res.status(403).json({ 
                message: `Acceso denegado. Se requieren permisos de ${roleRequerido}` 
            });
        }
        next();
    };
};