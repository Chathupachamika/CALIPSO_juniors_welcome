const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[Auth Middleware] JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
