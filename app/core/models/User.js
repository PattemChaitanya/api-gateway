const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../../utils/config");
const FirebaseConfig = require("../../config/firebase");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");

class User {
  constructor() {
    this.db = FirebaseConfig.getInstance().getDb();
    this.collectionName = "users";
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async create(userData) {
    try {
      // Hash password
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, SALT_ROUND);
      }

      // Add timestamps
      userData.createdAt = new Date().toISOString();
      userData.updatedAt = new Date().toISOString();

      // Generate API key
      const tempId = new Date().getTime().toString();
      userData.apiKey = await bcrypt.hash(tempId, SALT_ROUND);

      // Add to Firestore
      const usersRef = collection(this.db, this.collectionName);
      const docRef = await addDoc(usersRef, userData);

      return {
        id: docRef.id,
        ...userData,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>}
   */
  async findById(id) {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
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
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    try {
      const usersRef = collection(this.db, this.collectionName);
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return {
          id: docData.id,
          ...docData.data(),
        };
      }

      return null;
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  /**
   * Find user by API key
   * @param {string} apiKey - API key
   * @returns {Promise<Object>}
   */
  async findByApiKey(apiKey) {
    try {
      const usersRef = collection(this.db, this.collectionName);
      const q = query(usersRef, where("apiKey", "==", apiKey));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return {
          id: docData.id,
          ...docData.data(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error finding user by API key:", error);
      return null;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async update(id, updateData) {
    try {
      // Update timestamp
      updateData.updatedAt = new Date().toISOString();

      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, updateData);

      // Get updated document
      const updatedDoc = await getDoc(docRef);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      };
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Compare password
   * @param {Object} user - User object
   * @param {string} candidatePassword - Password to compare
   * @returns {Promise<boolean>}
   */
  async comparePassword(user, candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
      console.error("Error comparing password:", error);
      return false;
    }
  }
}

module.exports = User;
