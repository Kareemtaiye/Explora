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
      data: reviews,
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
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  if (!req.body.tour || !req.body.user) {
    return next(new AppError("Missing Tour or User Id"));
  }

  const hasReviewed = await Review.findOne({
    tour: req.body.tour,
    user: req.body.user,
  });

  console.log(hasReviewed);
  if (hasReviewed) {
    return next(new AppError("User already reviewed on this tour", 400));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: review,
    },
  });
});

exports.deleteReview = catchAsyncError(async function (req, res, next) {
  const { id, tourId } = req.params;

  if (!id || tourId) {
    return next(new AppError("Missing Tour or Review Id"));
  }

  const review = await Review.findOneAndDelete({ _id: id, tour: tourId });

  if (!review) {
    return next(new AppError("Review with that Id cannot be found!", 400));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.UpdateReview = catchAsyncError(async function (req, res, next) {
  const { id, tourId } = req.params;
  const { rating, review } = req.body;
  if (!id || !tourId) {
    return next(new AppError("Missing Tour or Review Id"));
  }

  const updatedReview = await Review.findOneAndUpdate(
    { _id: id, tour: tourId },
    { rating, review },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: updatedReview,
    },
  });
});
