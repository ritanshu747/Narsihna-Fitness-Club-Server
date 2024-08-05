const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Others"],
    },
    // weight: {
    //     type: Number,
    //     //required: true,
    // },
    // height: {
    //     type: String,
    //     //required: true,
    // },
    password: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
    },
    resetPasswordExpires: {
        type: Date,
    },
    accountType: {
        type: String,
        enum: ["Admin", "User"],
    },
    token: {
        type : String,
    },
});

module.exports = mongoose.model("User", userSchema);
