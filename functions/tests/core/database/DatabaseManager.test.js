const DatabaseManager = require("../../../app/core/database/DatabaseManager");
const { getFirestore } = require("firebase/firestore");
const FirebaseConfig = require("../../../app/config/firebase");

// Mock Firebase configuration
jest.mock("../../../app/config/firebase", () => {
  return {
    getInstance: jest.fn().mockReturnValue({
      getDb: jest.fn().mockReturnValue({}),
    }),
  };
});

describe("DatabaseManager", () => {
  let dbManager;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    dbManager = new DatabaseManager();
  });

  describe("connect", () => {
    it("should connect to Firestore successfully", async () => {
      const result = await dbManager.connect();

      // Verify Firestore instance was requested
      expect(FirebaseConfig.getInstance).toHaveBeenCalled();
      expect(FirebaseConfig.getInstance().getDb).toHaveBeenCalled();

      // Verify connection state
      expect(dbManager.isInitialized).toBe(true);
      expect(result).toBeDefined();
    });

    it("should handle connection errors", async () => {
      // Mock getInstance to throw an error
      FirebaseConfig.getInstance.mockImplementationOnce(() => {
        throw new Error("Firebase connection error");
      });

      await expect(dbManager.connect()).rejects.toThrow("Firebase connection error");
    });
  });

  describe("disconnect", () => {
    it("should 'disconnect' from Firestore successfully", async () => {
      await dbManager.connect();
      await dbManager.disconnect();
      expect(dbManager.isInitialized).toBe(false);
    });
  });

  describe("isConnected", () => {
    it("should return true when connected", async () => {
      await dbManager.connect();
      expect(dbManager.isConnected()).toBe(true);
    });

    it("should return false when disconnected", async () => {
      expect(dbManager.isConnected()).toBe(false);
    });
  });

  describe("getConnection", () => {
    it("should return Firestore instance", async () => {
      await dbManager.connect();
      const connection = dbManager.getConnection();
      expect(connection).toBeDefined();
    });
  });
});
