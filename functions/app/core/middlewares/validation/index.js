const { body, param, query, validationResult } = require("express-validator");

// Validation error handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Common validation rules
const userValidationRules = {
  register: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username can only contain letters, numbers, underscores and hyphens"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Must be a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage("Password must contain at least one letter and one number"),
    validate,
  ],

  login: [
    body("email").trim().isEmail().normalizeEmail().withMessage("Must be a valid email address"),
    body("password").not().isEmpty().withMessage("Password is required"),
    validate,
  ],
};

const serviceValidationRules = {
  create: [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Service name must be between 2 and 50 characters"),
    body("endpoints").isArray().withMessage("Endpoints must be an array"),
    body("endpoints.*")
      .isString()
      .matches(/^\/[a-zA-Z0-9\/_-]*$/)
      .withMessage("Each endpoint must be a valid URL path"),
    validate,
  ],

  update: [
    param("id")
      .isString()
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage("Invalid service ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Service name must be between 2 and 50 characters"),
    validate,
  ],
};

const logValidationRules = {
  query: [
    query("service")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Service name must be between 2 and 50 characters"),
    query("level")
      .optional()
      .isIn(["info", "warn", "error", "debug"])
      .withMessage("Invalid log level"),
    query("type")
      .optional()
      .isIn(["request", "error", "metrics", "system"])
      .withMessage("Invalid log type"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Limit must be between 1 and 1000"),
    query("skip").optional().isInt({ min: 0 }).withMessage("Skip must be a non-negative integer"),
    validate,
  ],
};

const authValidationRules = {
  token: [body("token").trim().not().isEmpty().withMessage("Token is required"), validate],

  apiKey: [
    query("apiKey").trim().isLength({ min: 32, max: 64 }).withMessage("Invalid API key format"),
    validate,
  ],
};

module.exports = {
  userValidationRules,
  serviceValidationRules,
  logValidationRules,
  authValidationRules,
};
