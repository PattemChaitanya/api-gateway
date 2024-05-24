const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis);

const redisClient = redis.createClient({
  port: 9090,
});

module.exports = {
  redisClient,
};
