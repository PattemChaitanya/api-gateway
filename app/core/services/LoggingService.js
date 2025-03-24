const BaseService = require("./BaseService");
const Log = require("../models/logs");
const morgan = require("morgan");

class LoggingService extends BaseService {
  constructor() {
    super();
    this.logModel = Log;
  }

  /**
   * Initialize request logging middleware
   * @returns {Function} Morgan middleware
   */
  getRequestLogger() {
    return morgan((tokens, req, res) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens["response-time"](req, res),
        userAgent: tokens["user-agent"](req, res),
        ip: tokens["remote-addr"](req, res),
        requestId: req.id,
        service: req.headers["app_id"] || "unknown",
      };

      // Log to database
      this.logRequest(logEntry);

      // Return formatted log line for console
      return JSON.stringify(logEntry);
    });
  }

  /**
   * Log request details to database
   * @param {Object} logEntry - Log entry details
   */
  async logRequest(logEntry) {
    try {
      await this.logModel.addLog(logEntry);
    } catch (error) {
      console.error("Failed to save log entry:", error);
    }
  }

  /**
   * Log error details
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  async logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: "error",
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      context,
      service: context.service || "unknown",
    };

    console.error(JSON.stringify(errorLog));

    try {
      await this.logModel.addLog(errorLog);
    } catch (err) {
      console.error("Failed to save error log:", err);
    }
  }

  /**
   * Get logs with filtering
   * @param {Object} filters - Filter conditions
   * @returns {Promise<Array>}
   */
  async getLogs(filters = {}, limit = 100, skip = 0) {
    try {
      if (filters.service) {
        return await this.logModel.getLogsByService(filters.service, limit, skip);
      }
      return await this.logModel.getLogs(filters, limit, skip);
    } catch (error) {
      console.error("Failed to retrieve logs:", error);
      throw error;
    }
  }

  /**
   * Log performance metrics
   * @param {Object} metrics - Performance metrics
   */
  async logMetrics(metrics) {
    const metricLog = Object.assign(
      {
        timestamp: new Date().toISOString(),
        level: "info",
        type: "metrics",
      },
      metrics,
    );

    try {
      await this.logModel.addLog(metricLog);
    } catch (error) {
      console.error("Failed to save metrics:", error);
    }
  }
}

module.exports = LoggingService;
