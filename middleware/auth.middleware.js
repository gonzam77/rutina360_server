const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const ROLE_SUPER_ADMIN = 1;

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no provisto.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.authUser = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inv\u00e1lido o expirado.' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = Number(req.authUser?.idRole);
    if (!role) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }
    if (role === ROLE_SUPER_ADMIN) {
      return next();
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta accion.' });
    }
    return next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
