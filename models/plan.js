const mongoose = require('mongoose');

const planSchema  = new mongoose.Schema({
    name:{
        type:String
    },
    image:{
        type:String
    },
    desc:{
        type:String,
    },
    gender:{
        type:String
    },
    duration:{
        type:String
    },
    quantity:{
        type:Number,
    },
    price:{
        type:Number
    }

    
});

module.exports = mongoose.model("Plan",planSchema); 