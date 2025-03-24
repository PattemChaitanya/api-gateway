const { handler } = require("../../netlify/functions/health");

describe("Health Check Function", () => {
  it("should return basic health status", async () => {
    const event = {
      httpMethod: "GET",
      path: "/.netlify/functions/health",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        status: "success",
        message: "API Gateway is running",
        timestamp: expect.any(String),
      }),
    );
  });

  it("should return system metrics", async () => {
    const event = {
      httpMethod: "GET",
      path: "/.netlify/functions/health/metrics",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        status: "success",
        metrics: expect.objectContaining({
          cpu: expect.any(Object),
          memory: expect.any(Object),
        }),
        health: expect.objectContaining({
          status: expect.any(String),
        }),
      }),
    );
  });

  it("should handle invalid method", async () => {
    const event = {
      httpMethod: "POST",
      path: "/.netlify/functions/health",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(405);
    expect(body).toEqual(
      expect.objectContaining({
        status: "error",
        message: "Method not allowed",
      }),
    );
  });

  it("should handle invalid path", async () => {
    const event = {
      httpMethod: "GET",
      path: "/.netlify/functions/health/invalid",
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        status: "error",
        message: "Not found",
      }),
    );
  });
});
