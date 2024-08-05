const request = require('request');
require('dotenv').config();

exports.getWorkoutDetails = async (req, res) => {
    const { muscle } = req.body;
    request.get({
        url: 'https://api.api-ninjas.com/v1/exercises?muscle=' + muscle,
        headers: {
            'X-Api-Key': process.env.WORKOUT_API
        },
    }, (error, response, body) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Request failed' });
        } else if (response.statusCode !== 200) {
            return res.status(response.statusCode).json({ success: false, message: 'Error', error: body });
        } else {
            return res.json({ success: true, data: JSON.parse(body) });
        }
    });
};
