const { LoggingService } = require("../core/services/LoggingService");
const logger = new LoggingService();

class CustomError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

class AuthenticationError extends CustomError {
  constructor(message) {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

class AuthorizationError extends CustomError {
  constructor(message) {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error
  logger.logError({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: {
        message: err.message,
        code: err.errorCode,
        stack: err.stack,
      },
    });
  } else {
    // Production error response
    res.status(err.statusCode).json({
      status: err.status,
      error: {
        message: err.message,
        code: err.errorCode,
      },
    });
  }
};

/**
 * Async error wrapper to avoid try-catch blocks
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  errorHandler,
  asyncHandler,
};
