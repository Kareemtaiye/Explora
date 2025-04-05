const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    trim: true,
    required: [true, "Review cannot be empty"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Users",
    required: [true, "Review must belong to a user!"],
  },

  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tours",
    required: [true, "Review must belonmg to a tour!"],
  },
});

const Review = mongoose.model("Reviews", reviewSchema);

module.exports = Review;
