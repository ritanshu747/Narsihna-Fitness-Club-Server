const User = require("../models/user")
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const mailSender = require('../utils/mailsender');
const user = require("../models/user");

exports.resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: `This Email: ${email} is not registered with us. Please enter a valid Email.`
            });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const updateUser = await User.findOneAndUpdate(
            { email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000, // Set expiration time to 1 hour from now
            },
            { new: true }
        );

        const url = `http://localhost:3000/forgot-password/${token}`;

        await mailSender(email, "Password-Reset-Link", `Your link for password reset is ${url} . Please click this link to reset your password.`);

        return res.json({
            success: true,
            message: 'Email sent successfully. Please check your email to continue further.',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending reset mail.'
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all details."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Token is invalid",
            });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Token is expired. Please regenerate your token.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate({ token }, { password: hashedPassword }, { new: true });

        return res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password"
        });
    }
};
