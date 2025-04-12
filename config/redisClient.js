const redis = require("redis");

const client = redis.createClient();

client.on("error", err => {
  console.log("Redis client error", err);
});

(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.log("Error connecting to redis", err);
  }
})();

module.exports = client;
