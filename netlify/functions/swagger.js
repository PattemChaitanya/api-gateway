const swaggerConfig = require("../../app/config/swagger");

/**
 * Netlify function to serve Swagger OpenAPI specification
 * This allows the Swagger UI to work correctly both locally and in production
 */
exports.handler = async (event) => {
  try {
    // CORS headers for preflight requests
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: "",
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(swaggerConfig),
    };
  } catch (error) {
    console.error("Error serving Swagger configuration:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to serve API documentation",
      }),
    };
  }
};
