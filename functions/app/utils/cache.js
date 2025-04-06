const redis = require("redis");
const bluebird = require("bluebird");
const { REDIS_CONFIG } = require("./config");

bluebird.promisifyAll(redis);

const redisClient = redis.createClient({
  host: REDIS_CONFIG?.host || "localhost",
  port: REDIS_CONFIG?.port || 6379,
  password: REDIS_CONFIG?.password || null,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.warn("Redis Client Connected");
});

module.exports = {
  redisClient,
};
