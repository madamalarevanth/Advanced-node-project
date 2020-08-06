const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function(){
    console.log('I am about to run query')
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);
    return exec.apply(this,arguments);
}