const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

const dotenv = require('dotenv');
dotenv.config();
const database = require('./config/DB');
const PORT = process.env.PORT || 4000; 
database();
app.use(express.json());


app.use("/api/v1/auth", userRoutes);



// Default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Server is up and running..."
    });
});

app.listen(PORT, () => {
    console.log("Server is running smoothly");
});
