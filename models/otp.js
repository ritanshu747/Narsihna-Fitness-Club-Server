const mongoose = require('mongoose');
const mailSender = require("../utils/mailsender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String, 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, 
    }
});

const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email from Narsighna fitness club",
            `Your OTP is: ${otp}` 
        );
        console.log("Email sent successfully", mailResponse.response);
    } catch (error) {
        console.log("Error occurred while sending verification email", error);
        throw error;
    }
};

otpSchema.pre("save", async function (next) {
    console.log("New document saved to the database");
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("otp", otpSchema);
