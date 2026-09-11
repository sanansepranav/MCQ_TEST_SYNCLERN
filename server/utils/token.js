const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'synctest-platform';

/**
 * Generate a cryptographically signed JWT token with algorithm enforcement.
 */
const generateToken = (userId, extraPayload = {}) => {
  return jwt.sign(
    {
      id: userId,
      ...extraPayload,
    },
    config.jwt.secret,
    {
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      expiresIn: config.jwt.expiresIn,
    }
  );
};

/**
 * Strictly verify a JWT token preventing algorithm confusion (none attack) and forged headers.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
    });
  } catch (err) {
    // Fallback for legacy tokens signed without issuer during transition
    return jwt.verify(token, config.jwt.secret, {
      algorithms: [JWT_ALGORITHM],
    });
  }
};

module.exports = { generateToken, verifyToken, JWT_ALGORITHM };
