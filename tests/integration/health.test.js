const ApiTestHelper = require("../helpers/apiTestHelper");

describe("Health Check API", () => {
  let apiHelper;

  beforeAll(async () => {
    apiHelper = new ApiTestHelper();
    await apiHelper.init();
  });

  afterAll(async () => {
    await apiHelper.cleanup();
  });

  describe("GET /health", () => {
    it("should return 200 and health status", async () => {
      const response = await apiHelper.authRequest("get", "/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          message: expect.any(String),
          timestamp: expect.any(String),
        }),
      );
    });

    it("should include system metrics in response", async () => {
      const response = await apiHelper.authRequest("get", "/health/metrics");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          metrics: expect.objectContaining({
            cpu: expect.any(Object),
            memory: expect.any(Object),
            uptime: expect.any(Object),
          }),
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      // Simulate error by using invalid token
      const response = await apiHelper
        .authRequest("get", "/health")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.any(String),
        }),
      );
    });
  });
});
