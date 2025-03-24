const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { PORT } = require("./utils/config");
const databaseManager = require("./core/database/DatabaseManager");
const UserService = require("./core/services/UserService");
const CacheManager = require("./core/cache/CacheManager");
const LoggingService = require("./core/services/LoggingService");
const MonitoringService = require("./core/services/MonitoringService");
const { v4: uuidv4 } = require("uuid");

class Server {
  constructor() {
    this.app = express();
    this.port = PORT;
    this.services = {};
    this.cacheManager = new CacheManager("api-gateway");
    this.loggingService = new LoggingService();
    this.monitoringService = new MonitoringService(this.loggingService);
    this.server = null;

    this.initializeMiddleware();
    this.initializeServices();
    this.setupRoutes();
  }

  initializeMiddleware() {
    // Add request ID
    this.app.use((req, res, next) => {
      req.id = uuidv4();
      next();
    });

    this.app.use(cors());
    this.app.use(bodyParser.json());

    // Add request logging
    this.app.use(this.loggingService.getRequestLogger());

    // Add request monitoring
    this.app.use((req, res, next) => {
      res.on("finish", () => {
        this.monitoringService.trackRequest(req, res);
      });
      next();
    });

    // Add error handling middleware
    this.app.use((err, req, res, next) => {
      this.loggingService.logError(err, {
        requestId: req.id,
        service: req.headers["app_id"],
      });
      next(err);
    });
  }

  initializeServices() {
    this.services.user = new UserService({
      cacheManager: this.cacheManager,
    });
  }

  setupRoutes() {
    // Health check with enhanced metrics
    this.app.get("/health", (req, res) => {
      const healthStatus = this.monitoringService.getHealthStatus();
      const response = Object.assign({}, healthStatus, {
        database: databaseManager.isConnected() ? "connected" : "disconnected",
      });
      res.json(response);
    });

    // Monitoring metrics endpoint
    this.app.get("/metrics", async (req, res) => {
      try {
        const metrics = await this.monitoringService.getSystemMetrics();
        res.json(metrics);
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "monitoring",
        });
        res.status(500).json(this.services.user.handleError(error));
      }
    });

    // Logs endpoint
    this.app.get("/logs", async (req, res) => {
      try {
        const { service, level, type, limit = 100, skip = 0 } = req.query;
        const filters = {};
        if (service) filters.service = service;
        if (level) filters.level = level;
        if (type) filters.type = type;

        const logs = await this.loggingService.getLogs(filters, limit, skip);
        res.json(logs);
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "logging",
        });
        res.status(500).json(this.services.user.handleError(error));
      }
    });

    // User routes with enhanced error handling
    this.app.get("/user/:id", async (req, res) => {
      try {
        const result = await this.services.user.processRequest(req);
        res.json(this.services.user.transformResponse(result));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "user",
        });
        res.status(500).json(this.services.user.handleError(error));
      }
    });

    this.app.post("/user", async (req, res) => {
      try {
        const result = await this.services.user.processRequest(req);
        res.json(this.services.user.transformResponse(result));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "user",
        });
        res.status(500).json(this.services.user.handleError(error));
      }
    });
  }

  async start() {
    try {
      await databaseManager.connect();
      this.server = this.app.listen(this.port, () => {
        console.info(`Server running on http://localhost:${this.port}`);
        this.monitoringService.logMetrics();
      });
      return this.server;
    } catch (error) {
      console.error("Failed to start server:", error);
      throw new Error("Server startup failed");
    }
  }

  async stop() {
    try {
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }
      await databaseManager.disconnect();
    } catch (error) {
      console.error("Error during shutdown:", error);
      throw new Error("Server shutdown failed");
    }
  }
}

// Create server instance
const server = new Server();

// Handle graceful shutdown
const shutdownHandler = async () => {
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    console.error("Failed to shut down gracefully:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdownHandler);
process.on("SIGINT", shutdownHandler);

// Start server
server.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
