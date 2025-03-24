const {
  validateRequest,
  schemas,
  userSchemas,
} = require("../../../app/middleware/security/inputValidation");

describe("Input Validation", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("validateRequest middleware", () => {
    it("should pass validation for valid data", () => {
      mockReq.body = {
        email: "test@example.com",
        password: "Password123",
        name: "Test User",
      };

      const middleware = validateRequest(userSchemas.create);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid data", () => {
      mockReq.body = {
        email: "invalid-email",
        password: "123", // Too short
        name: "T", // Too short
      };

      const middleware = validateRequest(userSchemas.create);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          code: 400,
          message: "Validation failed",
        }),
      );
    });

    it("should validate query parameters", () => {
      mockReq.query = {
        page: 1,
        limit: 10,
        sort: "desc",
      };

      const middleware = validateRequest(schemas.pagination, "query");
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("User Schemas", () => {
    describe("create schema", () => {
      it("should validate valid user creation data", () => {
        const data = {
          email: "test@example.com",
          password: "Password123",
          name: "Test User",
          role: "user",
        };

        const { error } = userSchemas.create.validate(data);
        expect(error).toBeUndefined();
      });

      it("should reject invalid email", () => {
        const data = {
          email: "invalid-email",
          password: "Password123",
          name: "Test User",
        };

        const { error } = userSchemas.create.validate(data);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain("email");
      });

      it("should reject weak password", () => {
        const data = {
          email: "test@example.com",
          password: "123", // Too short and no letters
          name: "Test User",
        };

        const { error } = userSchemas.create.validate(data);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain("password");
      });
    });

    describe("update schema", () => {
      it("should validate partial updates", () => {
        const data = {
          name: "Updated Name",
        };

        const { error } = userSchemas.update.validate(data);
        expect(error).toBeUndefined();
      });

      it("should reject empty update", () => {
        const data = {};

        const { error } = userSchemas.update.validate(data);
        expect(error).toBeDefined();
      });
    });

    describe("login schema", () => {
      it("should validate valid login data", () => {
        const data = {
          email: "test@example.com",
          password: "password123",
        };

        const { error } = userSchemas.login.validate(data);
        expect(error).toBeUndefined();
      });

      it("should require both email and password", () => {
        const data = {
          email: "test@example.com",
        };

        const { error } = userSchemas.login.validate(data);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain("password");
      });
    });
  });
});
