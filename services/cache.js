const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const exec = mongoose.Query.prototype.exec;

//setting up redis
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

mongoose.Query.prototype.exec = async function() {
  console.log("i am about to run a query");

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  //See if we have a value for key in redis
  const cacheValue = await client.get(key);

  //if we do return that

  if (cacheValue) {
    console.log(cacheValue);
  }

  //otherwise issue the query to store that result in redis
  const result = await exec.apply(this, arguments);

  console.log("result", result);
};
