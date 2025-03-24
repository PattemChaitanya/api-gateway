const { createResponse, withErrorHandler } = require("./utils/handler");
const { MonitoringService } = require("../../app/core/services/MonitoringService");

const monitoring = new MonitoringService();

const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return createResponse(405, {
      status: "error",
      message: "Method not allowed",
    });
  }

  const path = event.path.replace("/.netlify/functions/health", "");

  if (path === "" || path === "/") {
    return createResponse(200, {
      status: "success",
      message: "API Gateway is running",
      timestamp: new Date().toISOString(),
    });
  }

  if (path === "/metrics") {
    const metrics = monitoring.getSystemMetrics();
    const status = monitoring.getHealthStatus();

    return createResponse(200, {
      status: "success",
      metrics,
      health: status,
    });
  }

  return createResponse(404, {
    status: "error",
    message: "Not found",
  });
};

exports.handler = withErrorHandler(handler);
