const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { PORT } = require("./utils/config");
const firebaseManager = require("./core/database/FirebaseManager");
const UserService = require("./core/services/UserService");
// const CacheManager = require("./core/cache/CacheManager");
const { LoggingService } = require("./core/services/LoggingService");
const MonitoringService = require("./core/services/MonitoringService");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { recipeRouter, monitoringRouter, redditRouter } = require("./routes");
const dotenv = require("dotenv");

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? "path.join(__dirname, '../.env.example')"
      : "path.join(__dirname, '../.env')",
});

class Server {
  constructor() {
    this.app = express();
    this.port = PORT;
    this.services = {};
    // this.cacheManager = new CacheManager("api-gateway");
    this.loggingService = new LoggingService();
    this.monitoringService = new MonitoringService(this.loggingService);
    this.server = null;

    this.initializeMiddleware();
    this.initializeServices();
    this.setupSwagger();
    this.setupRoutes();
  }

  initializeMiddleware() {
    // Add request ID
    this.app.use((req, res, next) => {
      req.id = uuidv4();
      next();
    });

    this.app.use(
      cors({
        origin: "*", // Allow all origins. need to change this to the allowed origins
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        // credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
      })
    );

    this.app.use(bodyParser.json());

    // Serve static files
    this.app.use("/public", express.static(path.join(__dirname, "../public")));

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

  setupSwagger() {
    // Serve Swagger UI
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "API Gateway Documentation",
        customfavIcon: "/public/favicon.ico",
        customCssUrl: "/public/swagger-custom.css",
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          deepLinking: true,
          tryItOutEnabled: true,
        },
      })
    );
  }

  initializeServices() {
    this.services.user = new UserService({
      // cacheManager: this.cacheManager,
    });
  }

  setupRoutes() {
    this.app.get("/user/:id", async (req, res) => {
      try {
        const result = await this.services.user.processRequest(req);
        res.json({
          success: true,
          data: this.services.user.transformResponse(result),
        });
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "user",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process user request",
        });
      }
    });

    this.app.post("/user", async (req, res) => {
      try {
        const result = await this.services.user.processRequest(req);
        res.json({
          success: true,
          data: this.services.user.transformResponse(result),
        });
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "user",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process user request",
        });
      }
    });

    // Recipe routes
    this.app.use("/api/v1", recipeRouter);

    // Monitoring routes
    this.app.use("/api/monitoring", monitoringRouter);

    // Reddit routes
    this.app.use("/api/v1", redditRouter);
  }

  async start() {
    try {
      // Initialize Firebase connection
      await firebaseManager.connect();

      // Log server startup
      this.loggingService.logInfo("Server starting", {
        service: "system",
        type: "startup",
        port: this.port,
      });

      this.server = this.app.listen(this.port, () => {
        console.info(`Server running on http://localhost:${this.port}`);

        //   // Log server metrics on startup
        //   this.monitoringService.logMetrics();

        //   // Set up periodic metrics logging
        //   setInterval(
        //     () => {
        //       this.monitoringService.logMetrics();
        //     },
        //     5 * 60 * 1000
        //   ); // Log every 5 minutes
      });

      // return this.server;
    } catch (error) {
      // console.error("Failed to start server:", error);
      this.loggingService.logError(error, {
        service: "system",
        type: "startup_error",
      });
      throw new Error("Server startup failed");
    }
  }

  async stop() {
    try {
      // Log server shutdown
      this.loggingService.logInfo("Server shutting down", {
        service: "system",
        type: "shutdown",
      });

      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }

      // Clean up Firebase connection
      await firebaseManager.disconnect();

      console.info("Server successfully shut down");
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

// module.exports = server;
