const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function(){

    //this key contains an object which contains id 
    //and the collection name concated to it to create a unique key 
    const key = Object.assign({}, this.getQuery(),{
        collection: this.mongooseCollection.name 
    });
    
    //see if we have a value for key in redis
    const cacheValue = client.get(key);

    //if exists return that 
    if (cacheValue){
        console.log(cacheValue);
        return JSON.parse(cacheValue);
    }

    //otherwise, issue the query to mongo and store 
    //result in redis
    const result = exec.apply(this,arguments);
    client.set(key, JSON.stringify(result));
    return result;
};