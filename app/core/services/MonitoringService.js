const BaseService = require("./BaseService");
const os = require("os");

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
  }

  /**
   * Get system metrics
   * @returns {Object} System metrics
   */
  getSystemMetrics() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usagePercent: (usedMemory / totalMemory) * 100,
      },
      uptime: os.uptime(),
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  }

  /**
   * Track request metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  trackRequest(req, res) {
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
    const systemMetrics = this.getSystemMetrics();
    const memoryUsagePercent = systemMetrics.memory.usagePercent;
    const cpuLoad = systemMetrics.cpu.loadAvg[0];

    return {
      status: this.getSystemStatus(memoryUsagePercent, cpuLoad),
      timestamp: new Date().toISOString(),
      metrics: {
        memory: {
          usage: memoryUsagePercent.toFixed(2) + "%",
          status: this.getMemoryStatus(memoryUsagePercent),
        },
        cpu: {
          load: cpuLoad.toFixed(2),
          status: this.getCpuStatus(cpuLoad),
        },
      },
      uptime: {
        system: this.formatUptime(systemMetrics.uptime),
        process: this.formatUptime(systemMetrics.process.uptime),
      },
    };
  }

  /**
   * Get system status based on metrics
   * @param {number} memoryUsage - Memory usage percentage
   * @param {number} cpuLoad - CPU load average
   * @returns {string} System status
   */
  getSystemStatus(memoryUsage, cpuLoad) {
    if (memoryUsage > 90 || cpuLoad > 80) {
      return "critical";
    }
    if (memoryUsage > 70 || cpuLoad > 60) {
      return "warning";
    }
    return "healthy";
  }

  /**
   * Get memory status
   * @param {number} usage - Memory usage percentage
   * @returns {string} Memory status
   */
  getMemoryStatus(usage) {
    if (usage > 90) return "critical";
    if (usage > 70) return "warning";
    return "healthy";
  }

  /**
   * Get CPU status
   * @param {number} load - CPU load
   * @returns {string} CPU status
   */
  getCpuStatus(load) {
    if (load > 80) return "critical";
    if (load > 60) return "warning";
    return "healthy";
  }

  /**
   * Format uptime in human-readable format
   * @param {number} uptime - Uptime in seconds
   * @returns {string} Formatted uptime
   */
  formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}

module.exports = MonitoringService;
