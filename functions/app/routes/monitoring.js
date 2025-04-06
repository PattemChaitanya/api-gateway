const express = require("express");
const MonitoringService = require("../core/services/MonitoringService");
const { LoggingService } = require("../core/services/LoggingService");
const firebaseManager = require("../core/database/FirebaseManager");

class MonitoringRouter {
  constructor() {
    this.router = express.Router();

    // Create shared instance of LoggingService
    this.loggingService = new LoggingService();

    // Create MonitoringService with the loggingService instance
    this.monitoringService = new MonitoringService(this.loggingService);

    this.setupRoutes();
  }

  /**
   * Setup monitoring routes
   */
  setupRoutes() {
    // Health check with enhanced metrics
    this.router.get("/health", this.getHealthStatus.bind(this));

    // Monitoring metrics endpoint
    this.router.get("/metrics", this.getMetrics.bind(this));

    // Logs endpoint
    this.router.get("/logs", this.getLogs.bind(this));
  }

  /**
   * Get system health status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getHealthStatus(req, res) {
    const healthStatus = this.monitoringService.getHealthStatus();
    const response = Object.assign({}, healthStatus, {
      database: firebaseManager.isConnected() ? "connected" : "disconnected",
    });
    res.json(response);
  }

  /**
   * Get system metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMetrics(req, res) {
    try {
      const metrics = await this.monitoringService.getSystemMetrics();

      // Log metrics using the loggingService instance
      await this.loggingService.logMetrics({
        type: "metrics_request",
        data: metrics,
      });

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      // Log error using the loggingService instance
      this.loggingService.logError(error, {
        requestId: req.id,
        service: "monitoring",
      });

      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve metrics",
      });
    }
  }

  /**
   * Get system logs with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLogs(req, res) {
    try {
      const { service, level, type, limit = 100, skip = 0 } = req.query;
      const filters = {};
      if (service) filters.service = service;
      if (level) filters.level = level;
      if (type) filters.type = type;

      // Parse numeric parameters
      const parsedLimit = parseInt(limit, 10) || 100;
      const parsedSkip = parseInt(skip, 10) || 0;

      // Get logs using the loggingService instance
      const logs = await this.loggingService.getLogs(filters, parsedLimit, parsedSkip);

      res.json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      // Log error using the loggingService instance
      this.loggingService.logError(error, {
        requestId: req.id,
        service: "logging",
      });

      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve logs",
      });
    }
  }
}

// Create router instance
const monitoringRouterInstance = new MonitoringRouter();

// Export the router
module.exports = monitoringRouterInstance.router;
