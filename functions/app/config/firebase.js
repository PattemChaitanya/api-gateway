const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

class FirebaseConfig {
  static #instance;
  #app;
  #db;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };

    this.#app = initializeApp(firebaseConfig);
    this.#db = getFirestore(this.#app);
  }

  static getInstance() {
    if (!FirebaseConfig.#instance) {
      FirebaseConfig.#instance = new FirebaseConfig();
    }
    return FirebaseConfig.#instance;
  }

  getDb() {
    return this.#db;
  }

  getApp() {
    return this.#app;
  }
}

module.exports = FirebaseConfig;
