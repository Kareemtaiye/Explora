const Tour = require("../models/Tour");
const ApiFeatures = require("../utilities/ApiFeatures");
const AppError = require("../utilities/AppError");
const catchAsyncError = require("../utilities/catchAsyncError");

exports.getCheapBestTour = function (req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-price,-createdAt,ratingsAverage";
  req.query.fields = "name,difficulty,price,ratingsAverage,ratingsQuantity";
  next();
};

exports.getAllTours = catchAsyncError(async function (req, res, next) {
  let tourApiFeatures = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await tourApiFeatures.query;

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.createTour = catchAsyncError(async function (req, res, next) {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: tour,
    },
  });
});

exports.getTour = catchAsyncError(async function (req, res, next) {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("TMissing tour Id"), 400);
  }

  const tour = await Tour.findById(id);

  if (!tour) {
    return next(new AppError("Tour with that Id cannot be found"), 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: tour,
    },
  });
});

exports.updateTour = catchAsyncError(async function (req, res, next) {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!tour) {
    return next(new AppError("Tour with that Id cannot be found"), 404);
  }

  res.status(201).json({
    status: "success",
    data: {
      data: tour,
    },
  });
});

exports.deleteTour = catchAsyncError(async function (req, res, next) {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("TMissing tour Id"), 400);
  }

  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    return next(new AppError("Tour with that Id cannot be found"));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getToursInYear = catchAsyncError(async function (req, res) {
  const { year } = req.params;

  const stats = await Tour.aggregate([
    {
      $unwind: {
        path: "$startDates",
        includeArrayIndex: "index",
        // preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: { name: "$name", startDate: "$startDates" } },
      },
    },
    {
      $set: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: stats.length,
    data: {
      data: stats,
    },
  });
});

exports.getTourStats = catchAsyncError(async function (req, res) {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        averageRatings: { $avg: "$ratingsAverage" },
        averagePrice: { $avg: "$price" },
        minimumPrice: { $min: "$price" },
        maximumPrice: { $max: "$price" },
      },
    },
    {
      $sort: { numTours: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: stats.length,
    data: {
      data: stats,
    },
  });
});

// "/tours-within/:distance/center/:latlng/unit/:unit"

exports.getToursWithin = catchAsyncError(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.1 : distance / 6378;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide your latitude and longitude in the format 'lat,lng'",
        400
      )
    );
  }

  console.log(distance, unit, latlng);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getToursDistance = catchAsyncError(async function (req, res, next) {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide your latitude and longitude in the format 'lat,lng'",
        400
      )
    );
  }

  const multuplier = unit === "mi" ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multuplier,
      },
    },

    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: distances.length,
    data: {
      data: distances,
    },
  });
});
