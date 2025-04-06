const bcrypt = require("bcrypt");
const FirebaseConfig = require("../../../config/firebase");
const { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } = require("firebase/firestore");

/**
 * User model for Firebase Firestore
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || "";
    this.email = data.email || "";
    this.password = data.password || "";
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.role = data.role || "user";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
    
    // Firebase reference
    this.db = FirebaseConfig.getInstance().getDb();
    this.collectionName = "users";
  }

  /**
   * Get collection reference
   * @returns {Object} Firestore collection reference
   */
  getCollectionRef() {
    return collection(this.db, this.collectionName);
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>} User object or null
   */
  static async findById(id) {
    try {
      const db = FirebaseConfig.getInstance().getDb();
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return new User({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding user ${id}:`, error);
      return null;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>} User object or null
   */
  static async findByEmail(email) {
    try {
      const db = FirebaseConfig.getInstance().getDb();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return new User({
          id: docData.id,
          ...docData.data(),
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  static async create(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }
      
      const db = FirebaseConfig.getInstance().getDb();
      const usersRef = collection(db, "users");
      
      // Add timestamp
      userData.createdAt = new Date().toISOString();
      userData.updatedAt = new Date().toISOString();
      
      const docRef = await addDoc(usersRef, userData);
      
      return new User({
        id: docRef.id,
        ...userData,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user
   * @returns {Promise<User>} Updated user
   */
  async save() {
    try {
      if (!this.id) {
        throw new Error("Cannot update user without ID");
      }
      
      // Don't save the db reference
      const { db, collectionName, ...userData } = this;
      
      // Update timestamp
      userData.updatedAt = new Date().toISOString();
      
      const docRef = doc(db, collectionName, this.id);
      await updateDoc(docRef, userData);
      
      return this;
    } catch (error) {
      console.error(`Error updating user ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * @returns {Promise<boolean>} Success status
   */
  async delete() {
    try {
      if (!this.id) {
        throw new Error("Cannot delete user without ID");
      }
      
      const docRef = doc(this.db, this.collectionName, this.id);
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error(`Error deleting user ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Compare password
   * @param {string} candidatePassword - Password to compare
   * @returns {Promise<boolean>} Match status
   */
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error("Error comparing password:", error);
      return false;
    }
  }
}

module.exports = User;
