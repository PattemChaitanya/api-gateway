const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

/**
 * Middleware to validate API key from request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.header("X-API-Key");

  if (!apiKey) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "API key is required",
    });
  }

  // TODO: Implement API key validation against database/cache
  // For now, using a simple environment variable check
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Invalid API key",
    });
  }

  next();
};

/**
 * Middleware to validate JWT token from request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Authentication token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Invalid authentication token",
    });
  }
};

/**
 * Middleware to check role-based access
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Access forbidden",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

module.exports = {
  validateApiKey,
  validateJWT,
  checkRole,
};
