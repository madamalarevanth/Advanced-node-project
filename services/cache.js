const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(){

    //this key contains an object which contains id 
    //and the collection name concated to it to create a unique key 
    const key = JSON.stringify(Object.assign({}, this.getQuery(),{
        collection: this.mongooseCollection.name 
    }));
    
    //see if we have a value for key in redis
    const cacheValue = await client.get(key);

    //if exists return that object by converting it into mongo document
    if (cacheValue){
        //converts the object into mongodb doc
        const doc =new this.model(JSON.parse(cacheValue));
        return doc;
    }

    //otherwise, issue the query to mongo and store 
    //result in redis
    const result =  await exec.apply(this,arguments);
    client.set(key, JSON.stringify(result));
    return result;
};