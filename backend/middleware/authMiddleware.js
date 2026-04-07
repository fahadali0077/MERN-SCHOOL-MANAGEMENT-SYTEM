const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token from the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, schoolId }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized — invalid or expired token' });
  }
};

module.exports = authMiddleware;
