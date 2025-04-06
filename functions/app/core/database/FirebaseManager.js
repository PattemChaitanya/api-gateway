const { getFirestore } = require('firebase/firestore');
const FirebaseConfig = require('../../config/firebase');

/**
 * Firebase Database Manager
 * Manages connection and operations with Firebase Firestore
 */
class FirebaseManager {
  constructor() {
    this.isInitialized = false;
    this.db = null;
  }

  /**
   * Initialize Firestore connection
   * @returns {Object} Firestore connection
   */
  async connect() {
    try {
      if (!this.isInitialized) {
        // Get Firestore instance from Firebase Config
        this.db = FirebaseConfig.getInstance().getDb();
        this.isInitialized = true;
        console.info('Connected to Firebase Firestore');
      }
      return this.db;
    } catch (error) {
      console.error('Failed to connect to Firebase:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Disconnect from Firestore (mostly a no-op for Firebase)
   * but included for API compatibility with previous MongoDB manager
   */
  async disconnect() {
    // Firebase handles connections internally, no explicit disconnect needed
    // This method exists for compatibility with the previous MongoDB manager
    console.info('Firebase connection released');
    this.isInitialized = false;
    return true;
  }

  /**
   * Get Firestore instance
   * @returns {Object} Firestore instance
   */
  getDb() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Check if connected to Firestore
   * @returns {boolean}
   */
  isConnected() {
    return this.isInitialized;
  }
}

// Create singleton instance
const firebaseManager = new FirebaseManager();
module.exports = firebaseManager; 