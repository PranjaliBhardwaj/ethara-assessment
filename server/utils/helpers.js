const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ id: String(userId), role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Wrap async route handlers to catch errors and forward to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { generateToken, asyncHandler };
