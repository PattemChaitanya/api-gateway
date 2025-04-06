const FirebaseConfig = require("../../config/firebase");
const { collection, addDoc, query, orderBy, limit, where, getDocs } = require("firebase/firestore");

/**
 * Logs model for Firebase Firestore
 */
class Log {
  static logs = [];
  static collectionName = "logs";
  
  /**
   * Get Firestore DB instance
   * @returns {Object} Firestore DB
   */
  static getDb() {
    return FirebaseConfig.getInstance().getDb();
  }
  
  /**
   * Add a log entry
   * @param {Object} logEntry - The log entry to add
   * @returns {Promise<Object>} The added log entry
   */
  static async addLog(logEntry) {
    try {
      // Add an ID if not present
      if (!logEntry.id) {
        logEntry.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      }
      
      // Store in memory for quick access
      Log.logs.push(logEntry);
      
      // Keep logs array from growing too large
      if (Log.logs.length > 5000) {
        Log.logs.shift();
      }
      
      // Store in Firestore if available
      try {
        const db = Log.getDb();
        const logsRef = collection(db, Log.collectionName);
        await addDoc(logsRef, logEntry);
      } catch (err) {
        console.error("Failed to save log to Firestore:", err);
        // Continue with in-memory logs even if Firestore fails
      }
      
      return logEntry;
    } catch (error) {
      console.error("Failed to add log:", error);
      return logEntry; // Return the log even if saving fails
    }
  }
  
  /**
   * Get logs with optional filtering
   * @param {Object} filters - Filters to apply
   * @param {number} limitCount - Maximum number of logs to return
   * @param {number} skip - Number of logs to skip
   * @returns {Promise<Array>} Filtered logs
   */
  static async getLogs(filters = {}, limitCount = 100, skip = 0) {
    try {
      const db = Log.getDb();
      const logsRef = collection(db, Log.collectionName);
      
      // Build query
      let q = query(
        logsRef,
        orderBy("timestamp", "desc"),
        limit(limitCount + skip),
      );
      
      // Add filters if provided
      if (filters.level) {
        q = query(q, where("level", "==", filters.level));
      }
      
      if (filters.type) {
        q = query(q, where("type", "==", filters.type));
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Format results
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Apply skip (Firestore doesn't support offset directly)
      return logs.slice(skip);
    } catch (error) {
      console.error("Failed to retrieve logs from Firestore:", error);
      
      // Fallback to in-memory logs
      let filteredLogs = [...Log.logs];
      
      // Apply filters
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      
      if (filters.type) {
        filteredLogs = filteredLogs.filter(log => log.type === filters.type);
      }
      
      // Sort by timestamp descending
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply pagination
      return filteredLogs.slice(skip, skip + limitCount);
    }
  }
  
  /**
   * Get logs filtered by service
   * @param {string} service - The service to filter by
   * @param {number} limitCount - Maximum number of logs to return
   * @param {number} skip - Number of logs to skip
   * @returns {Promise<Array>} Filtered logs
   */
  static async getLogsByService(service, limitCount = 100, skip = 0) {
    try {
      const db = Log.getDb();
      const logsRef = collection(db, Log.collectionName);
      
      // Build query
      const q = query(
        logsRef,
        where("service", "==", service),
        orderBy("timestamp", "desc"),
        limit(limitCount + skip),
      );
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Format results
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Apply skip (Firestore doesn't support offset directly)
      return logs.slice(skip);
    } catch (error) {
      console.error(`Failed to retrieve logs for service ${service} from Firestore:`, error);
      
      // Fallback to in-memory logs
      let filteredLogs = Log.logs.filter(log => log.service === service);
      
      // Sort by timestamp descending
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply pagination
      return filteredLogs.slice(skip, skip + limitCount);
    }
  }
}

module.exports = Log; 