const Review = require("../models/Review");
const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/AppError");

exports.getAllReviews = catchAsyncError(async function (req, res, next) {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsyncError(async function (req, res, next) {
  if (!req.params.id) {
    return next(new AppError("Missing review ID", 400));
  }

  if (!req.params.tourId) {
    return next(new AppError("Missing tour ID", 400));
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Cannot find review with that ID", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.createReview = catchAsyncError(async function (req, res, next) {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsyncError(async function (req, res, next) {
  const { id, tourId } = req.params;

  const review = await Review.findOneAndDelete({ _id: id, tour: tourId });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
