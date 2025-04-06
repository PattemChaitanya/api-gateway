const FirebaseConfig = require("../config/firebase");

async function connectToDatabase() {
  try {
    // Get the Firebase DB instance
    const db = FirebaseConfig.getInstance().getDb();
    console.info("Successfully connected to Firebase Firestore");
    return db;
  } catch (error) {
    console.error("Error connecting to Firebase Firestore:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
};
