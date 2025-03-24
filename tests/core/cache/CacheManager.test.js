const CacheManager = require("../../../app/core/cache/CacheManager");

describe("CacheManager", () => {
  let cacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  describe("set and get", () => {
    it("should set and get value successfully", () => {
      const key = "test-key";
      const value = { data: "test-data" };

      cacheManager.set(key, value);
      const cachedValue = cacheManager.get(key);

      expect(cachedValue).toEqual(value);
    });

    it("should return null for non-existent key", () => {
      const value = cacheManager.get("non-existent");
      expect(value).toBeNull();
    });

    it("should handle TTL expiration", async () => {
      const key = "ttl-test";
      const value = "test-value";
      const ttl = 1; // 1 second

      cacheManager.set(key, value, ttl);

      // Value should exist initially
      expect(cacheManager.get(key)).toBe(value);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Value should be null after expiration
      expect(cacheManager.get(key)).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete cached value", () => {
      const key = "delete-test";
      const value = "test-value";

      cacheManager.set(key, value);
      expect(cacheManager.get(key)).toBe(value);

      cacheManager.delete(key);
      expect(cacheManager.get(key)).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all cached values", () => {
      cacheManager.set("key1", "value1");
      cacheManager.set("key2", "value2");

      cacheManager.clear();

      expect(cacheManager.get("key1")).toBeNull();
      expect(cacheManager.get("key2")).toBeNull();
    });
  });

  describe("has", () => {
    it("should return true for existing key", () => {
      const key = "exists-test";
      cacheManager.set(key, "value");
      expect(cacheManager.has(key)).toBe(true);
    });

    it("should return false for non-existent key", () => {
      expect(cacheManager.has("non-existent")).toBe(false);
    });
  });

  describe("size", () => {
    it("should return correct cache size", () => {
      expect(cacheManager.size()).toBe(0);

      cacheManager.set("key1", "value1");
      expect(cacheManager.size()).toBe(1);

      cacheManager.set("key2", "value2");
      expect(cacheManager.size()).toBe(2);

      cacheManager.delete("key1");
      expect(cacheManager.size()).toBe(1);
    });
  });
});
