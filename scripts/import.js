const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const User = require("../models/User");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const fs = require("fs");

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, "utf8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, "utf8")
);

const { DATABASE, DATABASE_PASSWORD } = process.env;

const DB = DATABASE.replace("<db_password>", DATABASE_PASSWORD);

async function connectDatabase() {
  try {
    await mongoose.connect(DB);
    console.log("Database connected ");
  } catch (err) {
    console.log(err);
  }
}

async function importData() {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data added successfully");
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

async function DeleteData() {
  try {
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data deleted successfully");
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

connectDatabase().then(async () => {
  if (process.argv[2] === "--import") {
    importData();
    // mongoose.connection.close();
  } else if (process.argv[2] === "--delete") {
    DeleteData();
    // mongoose.connection.close();
  } else {
    console.log("Invalid argument. Use --import or --delete");
    mongoose.connection.close();
  }
});
