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


//Hello World this is my 1st blog, i am writing this to tell that this is my 1st project, i made a blogging website using HTML, CSS, JS, mongodb, node.js for all the work however a bit of AI's help was taken to make this project run without any bugs or lags.