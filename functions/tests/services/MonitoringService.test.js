/* eslint-env jest */
const MonitoringService = require("../../app/core/services/MonitoringService");

describe("MonitoringService", () => {
  let monitoringService;
  let mockLoggingService;

  beforeEach(() => {
    mockLoggingService = {
      logMetrics: jest.fn(),
    };
    monitoringService = new MonitoringService(mockLoggingService);
  });

  describe("getSystemMetrics", () => {
    it("should return system metrics with all required fields", () => {
      const metrics = monitoringService.getSystemMetrics();

      expect(metrics).toHaveProperty("cpu");
      expect(metrics).toHaveProperty("memory");
      expect(metrics).toHaveProperty("uptime");
      expect(metrics).toHaveProperty("process");

      expect(metrics.cpu).toHaveProperty("loadAvg");
      expect(metrics.cpu).toHaveProperty("cores");

      expect(metrics.memory).toHaveProperty("total");
      expect(metrics.memory).toHaveProperty("free");
      expect(metrics.memory).toHaveProperty("used");
      expect(metrics.memory).toHaveProperty("usagePercent");

      expect(metrics.process).toHaveProperty("uptime");
      expect(metrics.process).toHaveProperty("memory");
    });
  });

  describe("trackRequest", () => {
    it("should increment requestCount", () => {
      const req = {};
      const res = { statusCode: 200 };

      monitoringService.trackRequest(req, res);
      expect(monitoringService.metrics.requestCount).toBe(1);
    });

    it("should increment errorCount for status >= 400", () => {
      const req = {};
      const res = { statusCode: 500 };

      monitoringService.trackRequest(req, res);
      expect(monitoringService.metrics.errorCount).toBe(1);
    });

    it("should not increment errorCount for status < 400", () => {
      const req = {};
      const res = { statusCode: 200 };

      monitoringService.trackRequest(req, res);
      expect(monitoringService.metrics.errorCount).toBe(0);
    });

    it("should log metrics when interval is reached", () => {
      const req = {};
      const res = { statusCode: 200 };

      // Set last update to more than 5 minutes ago
      monitoringService.metrics.lastMetricsUpdate = Date.now() - 360000;
      monitoringService.trackRequest(req, res);

      expect(mockLoggingService.logMetrics).toHaveBeenCalled();
    });
  });

  describe("getHealthStatus", () => {
    it("should return health status with all required fields", () => {
      const status = monitoringService.getHealthStatus();

      expect(status).toHaveProperty("status");
      expect(status).toHaveProperty("timestamp");
      expect(status).toHaveProperty("metrics");
      expect(status).toHaveProperty("uptime");

      expect(status.metrics).toHaveProperty("memory");
      expect(status.metrics).toHaveProperty("cpu");

      expect(status.uptime).toHaveProperty("system");
      expect(status.uptime).toHaveProperty("process");
    });

    it("should return critical status for high memory and CPU usage", () => {
      jest.spyOn(monitoringService, "getSystemMetrics").mockReturnValue({
        memory: { usagePercent: 95 },
        cpu: { loadAvg: [85] },
        uptime: 1000,
        process: { uptime: 1000, memory: {} },
      });

      const status = monitoringService.getHealthStatus();
      expect(status.status).toBe("critical");
      expect(status.metrics.memory.status).toBe("critical");
      expect(status.metrics.cpu.status).toBe("critical");
    });

    it("should return warning status for moderate memory and CPU usage", () => {
      jest.spyOn(monitoringService, "getSystemMetrics").mockReturnValue({
        memory: { usagePercent: 75 },
        cpu: { loadAvg: [65] },
        uptime: 1000,
        process: { uptime: 1000, memory: {} },
      });

      const status = monitoringService.getHealthStatus();
      expect(status.status).toBe("warning");
      expect(status.metrics.memory.status).toBe("warning");
      expect(status.metrics.cpu.status).toBe("warning");
    });

    it("should return healthy status for low memory and CPU usage", () => {
      jest.spyOn(monitoringService, "getSystemMetrics").mockReturnValue({
        memory: { usagePercent: 50 },
        cpu: { loadAvg: [30] },
        uptime: 1000,
        process: { uptime: 1000, memory: {} },
      });

      const status = monitoringService.getHealthStatus();
      expect(status.status).toBe("healthy");
      expect(status.metrics.memory.status).toBe("healthy");
      expect(status.metrics.cpu.status).toBe("healthy");
    });
  });

  describe("formatUptime", () => {
    it("should format uptime correctly", () => {
      const testCases = [
        { input: 30, expected: "0d 0h 0m 30s" },
        { input: 3600, expected: "0d 1h 0m 0s" },
        { input: 86400, expected: "1d 0h 0m 0s" },
        { input: 90061, expected: "1d 1h 1m 1s" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(monitoringService.formatUptime(input)).toBe(expected);
      });
    });
  });
});

// Security Issues:
//   Hardcoded secrets in config.yml and config.js
//   Same secret key used for both services ("mainServiceIsRestrictedOnly")
//   Basic authentication is used instead of more secure methods
//   No rate limiting implementation visible
//   No input validation middleware for request sanitization
// Error Handling Problems:
//   Many catch blocks simply re-throw errors without proper handling
//   Inconsistent error logging (some use console.log, others console.error)
//   No centralized error handling middleware
//   No structured error response format
//   Missing error monitoring and alerting system
// Configuration Management:
//   Environment variables aren't properly utilized
//   Hardcoded values for Redis port (9090)
//   No configuration validation
//   No separation of development/production configs
// Scalability Concerns:
//   No load balancing configuration
//   Single point of failure in Redis setup (no clustering)
//   No circuit breaker pattern for service calls
//   Missing health checks for services
//   No service discovery mechanism
// Monitoring and Logging:
//   Basic Morgan logging only
//   No structured logging format
//   Missing request tracing
//   No performance metrics collection
//   No monitoring for service health
// Database and Caching:
//   No connection pooling configuration for MongoDB
//   Single Redis instance without failover
//   No cache invalidation strategy
//   Missing database indexing strategy
//   No database migration system
// Code Architecture:
//   Missing TypeScript for better type safety
//   No API documentation (Swagger/OpenAPI)
//   Limited test coverage (no visible test files)
//   No dependency injection pattern
//   Tight coupling in some components
// Service Management:
//   No versioning for API endpoints
//   Missing service registry
//   No fallback mechanisms for service failures
//   Limited service discovery capabilities
//   No traffic management features
// Development Experience:
//   Limited development tools configuration
//   No linting setup
//   Missing automated testing setup
//   No CI/CD configuration
//   Limited documentation
// Performance:
//   No response caching headers
//   Missing compression middleware
//   No performance optimization strategies
//   No request timeout handling
//   Missing connection pooling
