const { initializeApp } = require("firebase/app");
const { getFirestore, terminate, collection, getDocs, deleteDoc } = require("firebase/firestore");
const { connectFirestoreEmulator } = require("firebase/firestore");

let firestoreApp;
let firestoreDb;

/**
 * Connect to the Firebase emulator.
 */
module.exports.connect = async () => {
  // Configure Firebase with test credentials
  const firebaseConfig = {
    projectId: "demo-test-project",
  };

  // Initialize Firebase app with a unique ID to avoid conflicts
  firestoreApp = initializeApp(firebaseConfig, "test-" + Date.now());
  firestoreDb = getFirestore(firestoreApp);

  // Connect to Firestore emulator
  connectFirestoreEmulator(firestoreDb, "localhost", 8080);

  return firestoreDb;
};

/**
 * Close the Firestore connection.
 */
module.exports.closeDatabase = async () => {
  if (firestoreDb) {
    await terminate(firestoreDb);
  }
};

/**
 * Remove all documents from all collections.
 */
module.exports.clearDatabase = async () => {
  if (firestoreDb) {
    // Get all collections
    const collections = ["users", "logs", "recipes"]; // Add all your collection names here

    for (const collectionName of collections) {
      const collectionRef = collection(firestoreDb, collectionName);
      const docs = await getDocs(collectionRef);

      // Delete all documents in the collection
      docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    }
  }
};
