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
const RecipeHandlers = require("./handlers/recipeHandlers");

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
        origin: "*", // Allow all origins
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
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
    // Serve Swagger documentation as the homepage
    // this.app.use("/", (req, res, next) => {
    //   // Only redirect if accessing the root path
    //   if (req.path === "/") {
    //     return res.redirect("/api-docs");
    //   }
    //   next();
    // });

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

    // Serve Swagger JSON
    this.app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  initializeServices() {
    this.services.user = new UserService({
      // cacheManager: this.cacheManager,
    });
  }

  setupRoutes() {
    // Health check with enhanced metrics
    this.app.get("/health", (req, res) => {
      const healthStatus = this.monitoringService.getHealthStatus();
      const response = Object.assign({}, healthStatus, {
        database: firebaseManager.isConnected() ? "connected" : "disconnected",
      });
      res.json(response);
    });

    // Monitoring metrics endpoint
    this.app.get("/metrics", async (req, res) => {
      try {
        const metrics = await this.monitoringService.getSystemMetrics();

        // Log metrics to Firestore via LoggingService
        await this.loggingService.logMetrics({
          type: "metrics_request",
          data: metrics,
        });

        res.json({
          success: true,
          data: metrics,
        });
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "monitoring",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to retrieve metrics",
        });
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

        // Parse numeric parameters
        const parsedLimit = parseInt(limit, 10) || 100;
        const parsedSkip = parseInt(skip, 10) || 0;

        const logs = await this.loggingService.getLogs(filters, parsedLimit, parsedSkip);
        res.json({
          success: true,
          count: logs.length,
          data: logs,
        });
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "logging",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to retrieve logs",
        });
      }
    });

    // User routes with enhanced error handling
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
    this.app.get("/recipes", async (req, res) => {
      try {
        const recipeHandlers = RecipeHandlers.getInstance();
        const mockEvent = {
          queryStringParameters: req.query,
        };
        const response = await recipeHandlers.handleGetAllRecipes(mockEvent);
        res.status(response.statusCode).json(JSON.parse(response.body));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "recipe",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process recipe request",
        });
      }
    });

    this.app.get("/recipes-random", async (req, res) => {
      try {
        const recipeHandlers = RecipeHandlers.getInstance();
        const response = await recipeHandlers.handleGetRandomRecipes();
        res.status(response.statusCode).json(JSON.parse(response.body));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "recipe",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process recipe request",
        });
      }
    });

    this.app.get("/recipes-search", async (req, res) => {
      try {
        const recipeHandlers = RecipeHandlers.getInstance();
        const mockEvent = {
          queryStringParameters: req.query,
        };
        const response = await recipeHandlers.handleSearchRecipes(mockEvent);
        res.status(response.statusCode).json(JSON.parse(response.body));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "recipe",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process recipe request",
        });
      }
    });

    this.app.get("/recipe", async (req, res) => {
      try {
        const recipeHandlers = RecipeHandlers.getInstance();
        const mockEvent = {
          pathParameters: { id: req.query.id },
        };
        const response = await recipeHandlers.handleGetRecipe(mockEvent);
        res.status(response.statusCode).json(JSON.parse(response.body));
      } catch (error) {
        this.loggingService.logError(error, {
          requestId: req.id,
          service: "recipe",
        });
        res.status(500).json({
          success: false,
          error: error.message || "Failed to process recipe request",
        });
      }
    });
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

        // Log server metrics on startup
        this.monitoringService.logMetrics();

        // Set up periodic metrics logging
        setInterval(
          () => {
            this.monitoringService.logMetrics();
          },
          5 * 60 * 1000
        ); // Log every 5 minutes
      });

      return this.server;
    } catch (error) {
      console.error("Failed to start server:", error);
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
