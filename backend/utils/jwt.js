const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('[JWT Error]', error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
