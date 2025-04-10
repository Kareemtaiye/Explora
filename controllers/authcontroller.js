const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsyncError = require("../utilities/catchAsyncError");
const AppError = require("../utilities/AppError");
const sendEmail = require("../utilities/email");

const { NODE_ENV, JWT_SECRET_KEY, JWT_EXPIRE_TIME, JWT_COOKIE_EXPIRES_TIME } =
  process.env;

const signToken = payload => {
  return jwt.sign({ id: payload }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE_TIME,
  });
};

const sendCookie = (res, payload) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + JWT_COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", payload, cookieOptions);
};

// const sendResponse = (statusCode, prop, token = undefined) => {};

exports.signUp = catchAsyncError(async function (req, res, next) {
  const { name, email, passwordConfirm, photo } = req.body;

  const user = await User.create({
    name,
    email,
    password: req.body.password,
    passwordConfirm,
    photo,
    role: req.body.role,
  });

  const token = signToken(user._id);
  sendCookie(res, token);

  const { password, active, __v, ...filteredUser } = user.toObject();
  // delete userObj.password

  res.status(201).json({
    status: "success",
    data: {
      data: filteredUser,
    },
    token,
  });
});

exports.logIn = catchAsyncError(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide your email and password"), 400);
  }

  const user = await User.findOne({ email }).select("+password");

  const passwordsComparison = await user?.comparePasswords(
    password + "",
    user?.password
  );

  if (!user && !passwordsComparison) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  user.passwordChangedDate = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsyncError(async function (req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access", 401)
    );
  }

  // Verify Json Web Token
  const decodedToken = await promisify(jwt.verify)(token, JWT_SECRET_KEY);

  //Check if user still exist.
  const user = await User.findById(decodedToken.id).select("+role");

  if (!user) {
    return next(
      new AppError(
        "The user for which this token was issued no longer exists!",
        401
      )
    );
  }

  //Check if user has chamged password after token was issued
  const passwordChange = user?.checkForPasswordChange(decodedToken.iat);

  if (passwordChange) {
    return next(
      new AppError("User recently changed password, please log in again!")
    );
  }

  //Add the user to the request object
  // console.log(user);
  req.user = user;
  next();
});

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do have permission to perform this action!", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsyncError(async function (req, res, next) {
  const email = req.body.email;

  if (!email) {
    return next(new AppError("Missing email address for password reset!", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with that email is not found!", 400));
  }

  const passwordResetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v2/users/reset-password/${passwordResetToken}`;

  try {
    await sendEmail({
      email: user.email,
      message: `Forgot your password? Click on the link below to reset your password\n ${url} which will expire in 10 minutes.
      \n If you did not make this request, kindly ignore this email `,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);

    return next(
      new AppError(
        "There was an error sending the reset password link to email",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Password reset token sent to mail",
  });
});

exports.resetPassword = catchAsyncError(async function (req, res, next) {
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError("Missing passowrd and confirm password"));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        "Invalid or expired token, please make the request again",
        400
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    meessage: "Password reset successfull",
  });
});
