require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 9080,
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017",
  DB_NAME: process.env.DB_NAME || "api_gateway_db",
  SECRET_KEY: process.env.GATEWAY_SECRET_KEY,
  SALT_ROUND: parseInt(process.env.SALT_ROUNDS) || 10,
  REDIS_CONFIG: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 9090,
    password: process.env.REDIS_PASSWORD,
  },
  JWT_SECRET: process.env.JWT_SECRET,
};
