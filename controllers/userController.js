const User = require("../models/User");
const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/AppError");
const sendResponse = require("../utilities/sendResponse");

exports.getAllUsers = catchAsyncError(async function (req, res, next) {
  const users = await User.find();

  res.status(200).json({
    status: "sucess",
    data: {
      users,
    },
  });
});

exports.getUser = catchAsyncError(async function (req, res, next) {
  const id = req.params.id;

  if (!id) {
    return next(new AppError("Missing user ID", 400));
  }

  const user = await User.findOne({ _id: id });

  if (!user) {
    return next(new AppError("No user with that ID found", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsyncError(async function (req, res, next) {
  const id = req.params.id;

  if (!id) {
    return next(new AppError("Missing user ID", 400));
  }

  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    return next(new AppError("No user with that ID found", 400));
  }

  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
  });
});

exports.updateUser = catchAsyncError(async function (req, res, next) {
  const id = req.params.id;

  if (!id) {
    return next(new AppError("Missing user ID", 400));
  }

  const user = await User.findOneAndUpdate({ _id: req.user._id }, req.body);

  if (!user) {
    return next(new AppError("No user with that ID found", 400));
  }

  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
  });
});

exports.getMe = catchAsyncError(async function (req, res, next) {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsyncError(async function (req, res, next) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Invalid routes for updating user password, use the /changePassword route",
        400
      )
    );
  }

  const filterBody = function (obj, fieldsArray) {
    const filteredObj = {};

    for (const prop of Object.keys(obj)) {
      console.log(prop);
      if (fieldsArray.includes(prop)) {
        filteredObj[prop] = obj[prop];
      }
    }
    // console.log(filteredObj);

    return filteredObj;
  };

  console.log();

  const allowedFields = filterBody(req.body, ["name", "email", "role"]);

  const user = await User.findByIdAndUpdate(req.user._id, allowedFields, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsyncError(async function (req, res, next) {
  const user = await User.findOne({ _id: req.user._id });

  user.active = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
  });
});
