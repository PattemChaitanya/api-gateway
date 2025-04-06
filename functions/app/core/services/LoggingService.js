const BaseService = require("./BaseService");
const Log = require("../models/logs");

class LoggingService extends BaseService {
  constructor() {
    super();
    this.logModel = Log;
    this.logs = [];
  }

  /**
   * Initialize request logging middleware
   * @returns {Function} Morgan middleware
   */
  getRequestLogger() {
    return (req, res, next) => {
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;
        this.logInfo(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          requestId: req.id,
        });
      });

      next();
    };
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
    const errorMeta = {
      ...context,
      stack: error.stack,
      name: error.name,
      code: error.code,
      service: context.service || "unknown",
    };

    // Create log entry
    const logEntry = this.log("error", error.message, errorMeta);

    // Also try to save to database if available
    try {
      if (this.logModel) {
        await this.logModel.addLog(logEntry);
      }
    } catch (err) {
      console.error("Failed to save error log to database:", err);
    }

    return logEntry;
  }

  /**
   * Get logs with filtering
   * @param {Object} filters - Filter conditions
   * @returns {Promise<Array>}
   */
  async getLogs(filters = {}, limit = 100, skip = 0) {
    try {
      // First try to get from database
      if (this.logModel) {
        if (filters.service) {
          return await this.logModel.getLogsByService(filters.service, limit, skip);
        }
        return await this.logModel.getLogs(filters, limit, skip);
      }

      // Fallback to in-memory logs if no database
      let filteredLogs = [...this.logs];

      // Apply filters
      if (filters.level) {
        filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
      }
      if (filters.service) {
        filteredLogs = filteredLogs.filter((log) => log.service === filters.service);
      }

      // Sort by timestamp descending
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply pagination
      return filteredLogs.slice(skip, skip + limit);
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
      metrics
    );

    try {
      if (this.logModel) {
        await this.logModel.addLog(metricLog);
      }
    } catch (error) {
      console.error("Failed to save metrics:", error);
    }
  }

  /**
   * Log a message at specified level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} The log entry
   */
  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    // Log to console
    if (level === "error") {
      console.error(JSON.stringify(logEntry));
    } else {
      console.warn(JSON.stringify(logEntry));
    }

    // Keep in-memory copy
    this.logs.push(logEntry);

    // Keep logs array from growing too large
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    return logEntry;
  }

  /**
   * Log at info level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} The log entry
   */
  logInfo(message, meta = {}) {
    return this.log("info", message, meta);
  }

  /**
   * Log at warning level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} The log entry
   */
  logWarning(message, meta = {}) {
    return this.log("warning", message, meta);
  }
}

module.exports = { LoggingService };
