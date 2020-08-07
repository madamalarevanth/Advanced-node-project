const { Mongoose } = require("mongoose");

const mongoose = require('mongoose');
const User = mongoose.model('User');


//jest only executes test suite i.e only .test.js files so it doesnt know the user model
module.exports = ()=>{
    return new User({}).save();
};