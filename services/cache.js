const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){
    //create a usecache variable in query prototype 
    //which can act as a condition to use the cache or not 
    this.useCache = true;

    //obtains a hashkey to identify user
    this.hashKey = JSON.stringify(options.key || '');

    //return the value so we it can be chainable
    return this;
}

mongoose.Query.prototype.exec = async function(){
    //refer to useCache variable if it is set then use the caching
    // else dont use it  
    if (!this.useCache){
        return exec.apply(this,arguments);
    }

    //this key contains an object which contains id 
    //and the collection name concated to it to create a unique key 
    const key = JSON.stringify(Object.assign({}, this.getQuery(),{
        collection: this.mongooseCollection.name 
    }));
    
    //see if we have a value for key in redis
    const cacheValue = await client.hget(this.hashKey,key);

    //if exists return that object by converting it into mongo document
    if (cacheValue){
        //cacheValue can be either a single object or array of objects 
        const doc =JSON.parse(cacheValue);

        //check if doc value is single or array
        //converts the object into mongodb doc and return
        return  Array.isArray(doc) ?
            doc.map(d=> new this.model(d)):
            new this.model(doc);  
    }

    //otherwise, issue the query to mongo and store 
    //result in redis
    const result =  await exec.apply(this,arguments);
    client.hmset(this.hashKey, key, JSON.stringify(result),'EX',10);
    return result;
};