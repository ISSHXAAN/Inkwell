const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('The server will continue running but database features will not work.');
    console.error('Please make sure MongoDB is running or update MONGODB_URI in server/.env');
  }
};

module.exports = connectDB;
