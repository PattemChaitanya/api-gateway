const { redisClient } = require("../../utils/cache");

class CacheManager {
  constructor(prefix = "", ttl = 3600) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  /**
   * Generate cache key
   * @param {string} key - Base key
   * @returns {string}
   */
  generateKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const value = await redisClient.getAsync(this.generateKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttl = this.ttl) {
    try {
      await redisClient.setAsync(this.generateKey(key), JSON.stringify(value), "EX", ttl);
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    try {
      await redisClient.delAsync(this.generateKey(key));
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  /**
   * Clear all keys with prefix
   * @returns {Promise<boolean>}
   */
  async clearAll() {
    try {
      const keys = await redisClient.keysAsync(`${this.prefix}:*`);
      if (keys.length > 0) {
        await redisClient.delAsync(keys);
      }
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }
}

module.exports = CacheManager;
