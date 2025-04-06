const BaseService = require("./BaseService");
const { redisClient } = require("../../utils/cache");
const UserModel = require("../models/User");

class UserService extends BaseService {
  constructor(config) {
    super(config);
    this.userModel = new UserModel();
    this.cachePrefix = "user:";
  }

  /**
   * Validate user request
   * @param {Object} req - Express request object
   * @returns {Promise<boolean>}
   */
  async validateRequest(req) {
    const { username, email, password } = req.body;
    if (req.method === "POST") {
      if (!username || !email || !password) {
        throw new Error("Missing required fields");
      }
    }
    return true;
  }

  /**
   * Get user from cache or database
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getUserFromCache(userId) {
    const cacheKey = `${this.cachePrefix}${userId}`;
    const cachedUser = await redisClient.getAsync(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    return null;
  }

  /**
   * Set user in cache
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   */
  async setUserInCache(userId, userData) {
    const cacheKey = `${this.cachePrefix}${userId}`;
    await redisClient.setAsync(cacheKey, JSON.stringify(userData), "EX", 3600);
  }

  /**
   * Process user request
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  async processRequest(req) {
    await this.validateRequest(req);

    switch (req.method) {
      case "GET": {
        const userId = req.params.id;
        let user = await this.getUserFromCache(userId);
        if (!user) {
          user = await this.userModel.findById(userId);
          if (user) {
            await this.setUserInCache(userId, user);
          }
        }
        return user;
      }

      case "POST": {
        const userData = req.body;
        const user = await this.userModel.create(userData);
        await this.setUserInCache(user.id, user);
        return user;
      }

      default:
        throw new Error(`Method ${req.method} not supported`);
    }
  }
}

module.exports = UserService;
