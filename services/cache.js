const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const exec = mongoose.Query.prototype.exec;

//setting up redis
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    console.log("not using cache");
    return exec.apply(this, arguments);
  }

  //   console.log("using cache");
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  //See if we have a value for key in redis
  const cacheValue = await client.hget(this.hashKey, key);

  //if we do return that

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => this.model(d))
      : new this.model(doc);
  }

  //otherwise issue the query to store that result in redis
  const result = await exec.apply(this, arguments);
  client.hmset(this.hashKey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
