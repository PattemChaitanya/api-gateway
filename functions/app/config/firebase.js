const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

class FirebaseConfig {
  static #instance;
  #app;
  #db;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.MY_FIREBASE_API_KEY,
      authDomain: process.env.MY_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.MY_FIREBASE_PROJECT_ID,
      storageBucket: process.env.MY_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.MY_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.MY_FIREBASE_APP_ID,
      measurementId: process.env.MY_FIREBASE_MEASUREMENT_ID,
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
