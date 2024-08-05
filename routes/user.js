const express = require('express');
const router = express.Router();

const { login, signup, sendOTP, updatepassword } = require("../controllers/user");
const {forgotPassword,resetPasswordToken} = require('../controllers/resetpassword');
const {getNutritionData} =  require('../controllers/nutritionTracking')

const{getWorkoutDetails} = require('../controllers/workoutTracker');

router.post('/login', login);
router.post('/signup', signup);
router.post('/updatepassword', updatepassword); // Corrected function name
router.post('/sendotp', sendOTP); // Corrected route path

router.post('/resetPasswordToken',resetPasswordToken);
router.post('/forgotPassword',forgotPassword)

router.get('/getNutritionData',getNutritionData);
router.get("/getWorkoutDetails",getWorkoutDetails);

module.exports = router;
