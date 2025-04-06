const BaseService = require("./BaseService");

class MonitoringService extends BaseService {
  constructor(loggingService) {
    super();
    this.loggingService = loggingService;
    this.metrics = {
      startTime: Date.now(),
      requestCount: 0,
      errorCount: 0,
      lastMetricsUpdate: Date.now(),
    };
    this.requests = [];
  }

  /**
   * Get system metrics
   * @returns {Object} System metrics
   */
  getSystemMetrics() {
    const uptime = Math.floor((Date.now() - this.metrics.startTime) / 1000);

    const requestCount = this.requests.length;
    const statusCodes = this.requests.reduce((acc, req) => {
      acc[req.statusCode] = (acc[req.statusCode] || 0) + 1;
      return acc;
    }, {});

    return {
      uptime,
      requests: {
        total: requestCount,
        statusCodes,
      },
      memory: process.memoryUsage(),
    };
  }

  /**
   * Track request metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  trackRequest(req, res) {
    const requestTime = Date.now();
    this.requests.push({
      path: req.path,
      method: req.method,
      statusCode: res?.statusCode || 200,
      timestamp: requestTime,
    });

    // Keep only the last 100 requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }

    this.metrics.requestCount++;

    if (res.statusCode >= 400) {
      this.metrics.errorCount++;
    }

    // Log metrics every 5 minutes
    const now = Date.now();
    if (now - this.metrics.lastMetricsUpdate >= 300000) {
      this.logMetrics();
      this.metrics.lastMetricsUpdate = now;
    }
  }

  /**
   * Log current metrics
   */
  async logMetrics() {
    const systemMetrics = this.getSystemMetrics();
    const metrics = {
      timestamp: new Date().toISOString(),
      type: "metrics",
      requestMetrics: {
        totalRequests: this.metrics.requestCount,
        errorCount: this.metrics.errorCount,
        uptime: process.uptime(),
      },
      systemMetrics,
    };

    await this.loggingService.logMetrics(metrics);
  }

  /**
   * Get health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      status: "healthy",
      uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = MonitoringService;
