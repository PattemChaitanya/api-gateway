const {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  errorHandler,
} = require("../../app/middleware/errorHandler");

describe("Error Handler", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      path: "/test",
      method: "GET",
      id: "123",
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("Custom Error Classes", () => {
    it("should create ValidationError with correct properties", () => {
      const error = new ValidationError("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid input");
    });

    it("should create AuthenticationError with correct properties", () => {
      const error = new AuthenticationError("Invalid token");
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe("AUTHENTICATION_ERROR");
      expect(error.message).toBe("Invalid token");
    });

    it("should create AuthorizationError with correct properties", () => {
      const error = new AuthorizationError("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe("AUTHORIZATION_ERROR");
      expect(error.message).toBe("Access denied");
    });

    it("should create NotFoundError with correct properties", () => {
      const error = new NotFoundError("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe("NOT_FOUND_ERROR");
      expect(error.message).toBe("Resource not found");
    });
  });

  describe("Error Handler Middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should handle errors in development mode", () => {
      process.env.NODE_ENV = "development";
      const error = new CustomError("Test error");
      error.stack = "Error stack";

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        error: {
          message: "Test error",
          code: "INTERNAL_SERVER_ERROR",
          stack: "Error stack",
        },
      });
    });

    it("should handle errors in production mode", () => {
      process.env.NODE_ENV = "production";
      const error = new CustomError("Test error");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        error: {
          message: "Test error",
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    });

    it("should handle validation errors", () => {
      const error = new ValidationError("Invalid input");
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "fail",
        error: {
          message: "Invalid input",
          code: "VALIDATION_ERROR",
        },
      });
    });
  });
});
