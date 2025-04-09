const mongoose = require("mongoose");
const Tour = require("./Tour");

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    trim: true,
    required: [true, "Review cannot be empty"],
  },

  rating: {
    type: Number,
    min: 0,
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

reviewSchema.statics.calcRatingsStats = async function (tourId) {
  // const tour = await Tour.findById(tourId);
  // tour.ratingsQuantity = tour.ratingsQuantity + 1;
  // tour.ratingsAverage = tour.totalRatingsSum / tour.ratingsQuantity;
  // tour.totalRatingsSum = (tour.ratingsAverage * tour.ratingsQuantity).toFixed(
  //   2
  // );
  // await tour.save({ validateBeforeSave: false });

  const reviewStats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: reviewStats.length > 0 ? reviewStats[0].nRating : 0,
    ratingsAverage: reviewStats.length > 0 ? reviewStats[0].avgRatings : 4.0,
    totalRatingsSum: undefined,
  });
};

reviewSchema.post("save", async function (next) {
  await this.constructor.calcRatingsStats(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = this;

  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await this.r?.model.calcRatingsStats(doc.tour);

  console.log("calc");
  // console.log(this.r?.constructor.calcRatingsStats);
});

// reviewSchema.post(/findOneAnd/, function (doc) {});

const Review = mongoose.model("Reviews", reviewSchema);

module.exports = Review;
