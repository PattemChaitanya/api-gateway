const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recipe API Documentation",
      description: "API documentation for Recipe Management System",
      version: "1.0.0"
    },
    servers: [
      {
        url: "/.netlify/functions",
        description: "Netlify Functions"
      }
    ],
    paths: {
      "/recipes": {
        get: {
          summary: "Get all recipes with pagination",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: {
                type: "integer",
                default: 1
              }
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 10
              }
            }
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RecipePagination"
                  }
                }
              }
            }
          }
        }
      },
      "/recipes-random": {
        get: {
          summary: "Get 10 random recipes",
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Recipe"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/recipes-search": {
        get: {
          summary: "Search recipes",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "Search query string"
            }
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Recipe"
                    }
                  }
                }
              }
            },
            400: {
              description: "Bad Request - Missing search query",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/recipe": {
        get: {
          summary: "Get single recipe by ID",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: {
                type: "string"
              }
            }
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Recipe"
                  }
                }
              }
            },
            404: {
              description: "Recipe not found"
            }
          }
        },
        put: {
          summary: "Update recipe",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: {
                type: "string"
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RecipeUpdate"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Recipe updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Recipe"
                  }
                }
              }
            },
            404: {
              description: "Recipe not found"
            }
          }
        }
      }
    },
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
        Recipe: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            ingredients: {
              type: "array",
              items: {
                type: "string"
              }
            },
            instructions: {
              type: "array",
              items: {
                type: "string"
              }
            },
            cookingTime: {
              type: "integer",
              description: "Cooking time in minutes"
            },
            servings: {
              type: "integer"
            },
            imageUrl: {
              type: "string"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        RecipeUpdate: {
          type: "object",
          properties: {
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            ingredients: {
              type: "array",
              items: {
                type: "string"
              }
            },
            instructions: {
              type: "array",
              items: {
                type: "string"
              }
            },
            cookingTime: {
              type: "integer"
            },
            servings: {
              type: "integer"
            },
            imageUrl: {
              type: "string"
            }
          }
        },
        RecipePagination: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Recipe"
              }
            },
            hasMore: {
              type: "boolean"
            }
          }
        }
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
