const FirebaseConfig = require("../../config/firebase");

class DatabaseManager {
  constructor() {
    this.isInitialized = false;
    this.db = null;
  }

  /**
   * Connect to Firebase Firestore
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      if (!this.isInitialized) {
        // Get Firestore instance from Firebase Config
        this.db = FirebaseConfig.getInstance().getDb();
        this.isInitialized = true;
        console.warn("Connected to Firebase Firestore database");
      }
      return this.db;
    } catch (error) {
      console.error("Firebase database connection error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from Firebase (mostly a no-op for Firebase)
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      // Firebase handles connections internally, no explicit disconnect needed
      console.warn("Firebase connection released");
      this.isInitialized = false;
    } catch (error) {
      console.error("Firebase disconnection error:", error);
      throw error;
    }
  }

  /**
   * Get Firestore instance
   * @returns {Object}
   */
  getConnection() {
    return this.db;
  }

  /**
   * Check if connected to Firebase
   * @returns {boolean}
   */
  isConnected() {
    return this.isInitialized;
  }

  /**
   * Create indexes for collections - not directly supported in Firebase client SDK
   * This is maintained for API compatibility but doesn't perform any operation
   * Firebase indexes are managed in the Firebase console or using Firebase CLI
   * @param {Object} indexes - Collection indexes configuration
   * @returns {Promise<void>}
   */
  async createIndexes(indexes) {
    console.warn(
      "Firebase indexes should be managed in the Firebase console or using Firebase CLI",
    );
    return true;
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();
module.exports = databaseManager;
