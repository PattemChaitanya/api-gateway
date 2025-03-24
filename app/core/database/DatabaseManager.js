const mongoose = require("mongoose");
const { MONGODB_URL, DB_NAME } = require("../../utils/config");

class DatabaseManager {
  constructor() {
    this.url = MONGODB_URL;
    this.dbName = DB_NAME;
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.connection = await mongoose.connect(`${this.url}/${this.dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to database");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from database");
    } catch (error) {
      console.error("Database disconnection error:", error);
      throw error;
    }
  }

  /**
   * Get mongoose connection
   * @returns {mongoose.Connection}
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Check if connected to database
   * @returns {boolean}
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Create indexes for collections
   * @param {Object} indexes - Collection indexes configuration
   * @returns {Promise<void>}
   */
  async createIndexes(indexes) {
    try {
      for (const [collection, fields] of Object.entries(indexes)) {
        const model = mongoose.model(collection);
        await model.createIndexes(fields);
      }
    } catch (error) {
      console.error("Index creation error:", error);
      throw error;
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();
module.exports = databaseManager;
