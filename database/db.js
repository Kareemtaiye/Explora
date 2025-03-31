const mongoose = require("mongoose");

const { DATABASE, DATABASE_PASSWORD } = process.env;

const DB = DATABASE.replace("<db_password>", DATABASE_PASSWORD);

async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
}

module.exports = connectDB;
