const redis = require("redis");
const bluebird = require("bluebird");
const { REDIS_CONFIG } = require("./config");

bluebird.promisifyAll(redis);

const redisClient = redis.createClient({
  host: REDIS_CONFIG.host,
  port: REDIS_CONFIG.port,
  password: REDIS_CONFIG.password,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

module.exports = {
  redisClient,
};
