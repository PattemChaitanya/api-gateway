const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gateway Documentation",
      version: "1.0.0",
      description:
        "A robust API Gateway service for managing and routing service requests, featuring authentication, service registration, monitoring, and logging capabilities.",
      license: {
        name: "ISC",
        url: "https://opensource.org/licenses/ISC",
      },
      contact: {
        name: "API Gateway Support",
        url: "https://github.com/chaitanya/api-gateway",
        email: "support@api-gateway.com",
      },
    },
    servers: [
      {
        url: "http://localhost:9080",
        description: "Development server",
      },
      {
        url: "https://api-gateway.netlify.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for authentication",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error message description",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
          required: ["username", "email", "password"],
        },
        Service: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "user-service",
            },
            endpoints: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["/users", "/users/{id}"],
            },
          },
          required: ["name", "endpoints"],
        },
        Log: {
          type: "object",
          properties: {
            service: {
              type: "string",
              example: "user-service",
            },
            level: {
              type: "string",
              enum: ["info", "warn", "error", "debug"],
              example: "info",
            },
            type: {
              type: "string",
              enum: ["request", "error", "metrics", "system"],
              example: "request",
            },
            message: {
              type: "string",
              example: "Request processed successfully",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Services",
        description: "Service management endpoints",
      },
      {
        name: "Logs",
        description: "Logging and monitoring endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
  },
  apis: ["./app/core/middlewares/*.js", "./app/core/routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
