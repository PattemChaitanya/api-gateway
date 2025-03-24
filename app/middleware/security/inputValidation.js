const Joi = require("joi");

/**
 * Creates a validation middleware using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware
 */
const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!error) {
      next();
    } else {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      res.status(400).json({
        status: "error",
        code: 400,
        message: "Validation failed",
        errors,
      });
    }
  };
};

// Common validation schemas
const schemas = {
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

// Example validation schemas for different endpoints
const userSchemas = {
  create: Joi.object({
    email: schemas.email.required(),
    password: schemas.password.required(),
    name: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  }),

  update: Joi.object({
    email: schemas.email,
    name: Joi.string().min(2).max(50),
    role: Joi.string().valid("user", "admin"),
  }).min(1),

  login: Joi.object({
    email: schemas.email.required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  validateRequest,
  schemas,
  userSchemas,
};
