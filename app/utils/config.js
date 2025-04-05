require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Firebase Configuration
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  SALT_ROUND: parseInt(process.env.SALT_ROUND || "10", 10),

  // Redis Cache
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
