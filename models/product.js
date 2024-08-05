const mongoose = require('mongoose');
 
const productSchema  = new mongoose.Schema({
    Productname:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,

    },
    quantity:{
        type:Number
    }
})
module.exports = mongoose.model("Product",productSchema);