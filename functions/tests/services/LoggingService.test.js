const LoggingService = require("../../app/core/services/LoggingService");
const dbHandler = require("../helpers/db");

describe("LoggingService", () => {
  let loggingService;

  beforeAll(async () => {
    await dbHandler.connect();
    loggingService = new LoggingService();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe("logRequest", () => {
    it("should successfully log a request", async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: "GET",
        url: "/test",
        status: 200,
        responseTime: 50,
        userAgent: "test-agent",
        ip: "127.0.0.1",
        requestId: "test-id",
        service: "test-service",
      };

      await loggingService.logRequest(logEntry);
      const logs = await loggingService.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject(logEntry);
    });
  });

  describe("logError", () => {
    it("should successfully log an error", async () => {
      const error = new Error("Test error");
      const context = { service: "test-service", requestId: "test-id" };

      await loggingService.logError(error, context);
      const logs = await loggingService.getLogs({ level: "error" });

      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe("Test error");
      expect(logs[0].service).toBe("test-service");
    });

    it("should use unknown service when not provided", async () => {
      const error = new Error("Test error");
      await loggingService.logError(error);

      const logs = await loggingService.getLogs({ level: "error" });
      expect(logs[0].service).toBe("unknown");
    });
  });

  describe("getLogs", () => {
    beforeEach(async () => {
      const testLogs = [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          service: "service1",
          message: "test1",
        },
        {
          timestamp: new Date().toISOString(),
          level: "error",
          service: "service2",
          message: "test2",
        },
      ];

      for (const log of testLogs) {
        await loggingService.logModel.addLog(log);
      }
    });

    it("should get all logs without filters", async () => {
      const logs = await loggingService.getLogs();
      expect(logs).toHaveLength(2);
    });

    it("should filter logs by service", async () => {
      const logs = await loggingService.getLogs({ service: "service1" });
      expect(logs).toHaveLength(1);
      expect(logs[0].service).toBe("service1");
    });

    it("should handle pagination", async () => {
      const logs = await loggingService.getLogs({}, 1, 1);
      expect(logs).toHaveLength(1);
    });
  });

  describe("logMetrics", () => {
    it("should successfully log metrics", async () => {
      const metrics = {
        cpu: 50,
        memory: 80,
        requestCount: 100,
      };

      await loggingService.logMetrics(metrics);
      const logs = await loggingService.getLogs({ type: "metrics" });

      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe("metrics");
      expect(logs[0].level).toBe("info");
      expect(logs[0].metrics).toMatchObject(metrics);
    });
  });

  describe("getRequestLogger", () => {
    it("should return a morgan middleware function", () => {
      const middleware = loggingService.getRequestLogger();
      expect(typeof middleware).toBe("function");
    });
  });
});
