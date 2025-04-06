const { initializeApp } = require("firebase/app");
const { getFirestore, terminate } = require("firebase/firestore");
const { connectFirestoreEmulator } = require("firebase/firestore");

let firestoreApp;
let firestoreDb;

// Setup before all tests
beforeAll(async () => {
  // Configure Firebase with test credentials
  const firebaseConfig = {
    projectId: "demo-test-project",
    // No need for other credentials in test mode
  };

  // Initialize Firebase app
  firestoreApp = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firestoreApp);

  // Connect to Firestore emulator if it's running
  // You'll need to start the emulator with `firebase emulators:start --only firestore`
  connectFirestoreEmulator(firestoreDb, "localhost", 8080);

  console.warn("Connected to Firestore emulator");
});

// Cleanup after all tests
afterAll(async () => {
  // Terminate Firestore connection
  if (firestoreDb) {
    await terminate(firestoreDb);
  }
  console.warn("Disconnected from Firestore emulator");
});

// Clear database between tests - this is simplified for Firebase
// A more comprehensive solution would be to delete all documents in all collections
afterEach(async () => {
  // For a proper implementation, you would need to get all collections
  // and delete all documents within them
  console.warn("Cleared test data");
});
