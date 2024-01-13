require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    try {
        mongoose.connect(process.env.MONGO_CONNECTION_URL);
        console.log('Database Connected');
    } catch (error) {
        console.error('Connection Failed:', error.message);
    }
}

module.exports = connectDB;
