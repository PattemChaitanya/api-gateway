const DatabaseManager = require("../../../app/core/database/DatabaseManager");
const mongoose = require("mongoose");

describe("DatabaseManager", () => {
  let dbManager;

  beforeEach(() => {
    dbManager = new DatabaseManager();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe("connect", () => {
    it("should connect to database successfully", async () => {
      const result = await dbManager.connect();
      expect(result).toBe(true);
      expect(mongoose.connection.readyState).toBe(1);
    });

    it("should handle connection errors", async () => {
      const invalidUri = "mongodb://invalid:27017/test";
      dbManager.uri = invalidUri;

      await expect(dbManager.connect()).rejects.toThrow();
    });
  });

  describe("disconnect", () => {
    it("should disconnect from database successfully", async () => {
      await dbManager.connect();
      await dbManager.disconnect();
      expect(mongoose.connection.readyState).toBe(0);
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

  describe("getConnectionStatus", () => {
    it("should return connection status object", async () => {
      const status = dbManager.getConnectionStatus();
      expect(status).toHaveProperty("isConnected");
      expect(status).toHaveProperty("readyState");
      expect(status).toHaveProperty("host");
      expect(status).toHaveProperty("port");
      expect(status).toHaveProperty("database");
    });
  });
});
