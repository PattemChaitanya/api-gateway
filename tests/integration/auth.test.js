const ApiTestHelper = require("../helpers/apiTestHelper");
const { User } = require("../../app/core/models/User");
const bcrypt = require("bcrypt");

describe("Authentication API", () => {
  let apiHelper;
  let testUser;

  beforeAll(async () => {
    apiHelper = new ApiTestHelper();
    await apiHelper.init();
  });

  afterAll(async () => {
    await apiHelper.cleanup();
  });

  beforeEach(async () => {
    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash("Password123", 10);
    testUser = await User.create({
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "user",
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await apiHelper.authRequest("post", "/api/auth/login").send({
        email: testUser.email,
        password: "Password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              email: testUser.email,
              name: testUser.name,
              role: testUser.role,
            }),
          }),
        }),
      );
    });

    it("should reject invalid credentials", async () => {
      const response = await apiHelper.authRequest("post", "/api/auth/login").send({
        email: testUser.email,
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("Invalid credentials"),
        }),
      );
    });

    it("should validate required fields", async () => {
      const response = await apiHelper.authRequest("post", "/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Validation failed",
        }),
      );
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await apiHelper.authRequest("post", "/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          message: expect.stringContaining("logged out"),
        }),
      );
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile", async () => {
      const response = await apiHelper.authRequest("get", "/api/auth/me");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            email: expect.any(String),
            name: expect.any(String),
            role: expect.any(String),
          }),
        }),
      );
    });

    it("should handle unauthorized access", async () => {
      const response = await apiHelper
        .authRequest("get", "/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("unauthorized"),
        }),
      );
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should refresh token successfully", async () => {
      // First login to get refresh token
      const loginResponse = await apiHelper.authRequest("post", "/api/auth/login").send({
        email: testUser.email,
        password: "Password123",
      });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await apiHelper
        .authRequest("post", "/api/auth/refresh-token")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            token: expect.any(String),
            refreshToken: expect.any(String),
          }),
        }),
      );
    });

    it("should reject invalid refresh token", async () => {
      const response = await apiHelper
        .authRequest("post", "/api/auth/refresh-token")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("Invalid refresh token"),
        }),
      );
    });
  });
});
