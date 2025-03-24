const { MonitoringService } = require("../../../app/core/services/MonitoringService");
const { LoggingService } = require("../../../app/core/services/LoggingService");

const monitoring = new MonitoringService();
const logging = new LoggingService();

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  },
  body: JSON.stringify(body),
});

const handleError = (error) => {
  logging.logError({
    message: error.message,
    stack: error.stack,
  });

  return createResponse(error.statusCode || 500, {
    status: "error",
    message: error.message || "Internal Server Error",
  });
};

const withErrorHandler = (handler) => async (event, context) => {
  try {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === "OPTIONS") {
      return createResponse(200, {});
    }

    // Track request
    monitoring.trackRequest(event, { statusCode: 200 });

    const response = await handler(event, context);
    return response;
  } catch (error) {
    monitoring.trackRequest(event, { statusCode: error.statusCode || 500 });
    return handleError(error);
  }
};

module.exports = {
  createResponse,
  handleError,
  withErrorHandler,
};
