const sharp = require("sharp");
const User = require("../models/User");
const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/AppError");
const ApiFeatures = require("./../utilities/ApiFeatures");
const upload = require("../config/multerUpload");

// const sendResponse = require("../utilities/sendResponse");

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsyncError(async function (req, res, next) {
  if (!req.file) {
    return next();
  }

  req.file.filename = `ùser-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterBody = function (obj, fieldsArray) {
  const filteredObj = {};

  for (const prop of Object.keys(obj)) {
    if (fieldsArray.includes(prop)) {
      filteredObj[prop] = obj[prop];
    }
  }
  // console.log(filteredObj);

  return filteredObj;
};

exports.getAllUsers = catchAsyncError(async function (req, res, next) {
  const userApiFeatures = new ApiFeatures(User.find(), req.query)
    .filter()
    .paginate()
    .sort()
    .limitFields();

  const users = await userApiFeatures.query;

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
    data: null,
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
  if (!req.file && req.body.photo) {
    return next(
      new AppError("Photo upload cannot be a text but file(image)", 400)
    );
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Invalid routes for updating user password, use the /changePassword route",
        400
      )
    );
  }

  const allowedFields = filterBody(req.body, ["name", "email"]);

  if (req.file) {
    allowedFields.photo = req.file.filename;
  }
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
