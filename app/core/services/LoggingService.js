const BaseService = require("./BaseService");
const Log = require("../models/logs");
const morgan = require("morgan");

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
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logInfo(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          requestId: req.id
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

  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    
    console.log(JSON.stringify(logEntry));
    
    this.logs.push(logEntry);
    
    // Keep logs array from growing too large
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    return logEntry;
  }

  logInfo(message, meta = {}) {
    return this.log('info', message, meta);
  }

  logWarning(message, meta = {}) {
    return this.log('warning', message, meta);
  }

  logError(error, meta = {}) {
    const errorMeta = {
      ...meta,
      stack: error.stack,
      name: error.name
    };
    
    return this.log('error', error.message, errorMeta);
  }
}

module.exports = LoggingService;
