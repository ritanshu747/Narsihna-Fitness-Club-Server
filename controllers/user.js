const User = require('../models/user');
const OTP = require('../models/otp')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator   = require('otp-generator');
const mailSender = require('../utils/mailsender');
require('dotenv').config();


exports.sendOTP = async (req, res) => {
    try {
        // Fetch email from request body
        const { email } = req.body;

        // Check if user already exists
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(401).json({
                success: false,
                message: "User is already registered. Please try logging in."
            });
        }

        // Generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // Check if OTP is unique
        let isUnique = false;
        while (!isUnique) {
            const existingOTP = await OTP.findOne({ otp });
            if (!existingOTP) {
                isUnique = true;
            } else {
                otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
            }
        }

        // Create OTP entry
        const otpEntry = await OTP.create({ email, otp });

        // Send OTP via email
        const title = "OTP for Verification";
        const body = `<p>Your OTP for verification is: <strong>${otp}</strong></p>`;
        await mailSender(email, title, body);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Error in sending OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.signup = async (req, res) => {
    try {
        const { firstname, lastName, email, password, otp } = req.body;

        // Validation
        if (!firstname || !lastName || !email || !password || !otp) {
            return res.status(403).json({
                success: false,
                message: "Please fill all required fields!"
            });
        }

        // Check if user already exists
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(403).json({
                success: false,
                message: "User already exists. Try logging in."
            });
        }

        // Find the latest OTP for the user
        const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log('Latest OTP:', latestOTP);

        // Validate OTP
        if (!latestOTP || otp !== latestOTP.otp) {
            return res.status(400).json({
                success: false,
                message: 'The OTP is not valid',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            email,
            firstName: firstname,
            lastName,
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            user: newUser,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again.'
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Please fill all details",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Please register before login.",
            });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect.",
            });
        }

        // Generate JWT token
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token as cookie
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
        };
        res.cookie('token', token, options);

        // Return success response with token and user details
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                // Add other user fields here if needed
            },
            message: 'User login successful',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Login failed, please try again.',
        });
    }
};

exports.updatepassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword ,oldPassword} = req.body;
        // Validation
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Please fill all details."
            });
        }
        // Retrieve user from the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        // Compare old password with stored hashed password
    
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect."
            });
        }
        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "NewPassword and confirmPassword do not match."
            });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(confirmPassword, 10);
        // Update user's password
        const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
        return res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });
    } catch (error) {
        console.error('Error occurred while updating password', error);
        return res.status(500).json({
            success: false,
            message: 'Error occurred while updating password',
            error: error.message
        });
    }
};

