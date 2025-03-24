const ApiTestHelper = require("../helpers/apiTestHelper");
const { User } = require("../../app/core/models/User");

describe("User API", () => {
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
    // Create a test user
    testUser = await User.create({
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
      role: "user",
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "new@example.com",
        password: "Password123",
        name: "New User",
        role: "user",
      };

      const response = await apiHelper.authRequest("post", "/api/users").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            email: userData.email,
            name: userData.name,
            role: userData.role,
          }),
        }),
      );
    });

    it("should validate required fields", async () => {
      const response = await apiHelper.authRequest("post", "/api/users").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Validation failed",
        }),
      );
    });

    it("should prevent duplicate email", async () => {
      const response = await apiHelper.authRequest("post", "/api/users").send({
        email: testUser.email,
        password: "Password123",
        name: "Duplicate User",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("email already exists"),
        }),
      );
    });
  });

  describe("GET /api/users", () => {
    it("should list users with pagination", async () => {
      const response = await apiHelper
        .authRequest("get", "/api/users")
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: expect.any(Number),
          }),
        }),
      );
    });

    it("should filter users by role", async () => {
      const response = await apiHelper.authRequest("get", "/api/users").query({ role: "user" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: "user",
          }),
        ]),
      );
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get user by id", async () => {
      const response = await apiHelper.authRequest("get", `/api/users/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            _id: testUser._id.toString(),
            email: testUser.email,
            name: testUser.name,
          }),
        }),
      );
    });

    it("should return 404 for non-existent user", async () => {
      const response = await apiHelper.authRequest("get", "/api/users/nonexistentid");

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("not found"),
        }),
      );
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user", async () => {
      const updateData = {
        name: "Updated Name",
        role: "admin",
      };

      const response = await apiHelper
        .authRequest("put", `/api/users/${testUser._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            name: updateData.name,
            role: updateData.role,
          }),
        }),
      );
    });

    it("should validate update data", async () => {
      const response = await apiHelper
        .authRequest("put", `/api/users/${testUser._id}`)
        .send({ role: "invalid-role" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Validation failed",
        }),
      );
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user", async () => {
      const response = await apiHelper.authRequest("delete", `/api/users/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          message: expect.stringContaining("deleted"),
        }),
      );

      // Verify user is deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await apiHelper.authRequest("delete", "/api/users/nonexistentid");

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("not found"),
        }),
      );
    });
  });
});
