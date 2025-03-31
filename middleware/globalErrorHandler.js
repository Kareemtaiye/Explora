const AppError = require("../utilities/AppError");

const handleJsonWebTokenError = (err) => {
  return new AppError(err.message, 400);
};

const handleDuplicateErrorDB = (err) => {
  //Using KeyValue prop

  //Using errmsg prop
  const errValue = err.errmsg.match(/{(.*?)}/);
  const message = `Duplicate field ${errValue}`;
  return new AppError(errValue[1], 400);
};

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleValidationErrorDB = (err) => {
  return new AppError(err.message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, _, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log(err.stack);
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let errObj = Object.assign({}, err);
    console.log(errObj);

    if (err.name === "CastError") errObj = handleCastErrorDB(err);
    if (err.name === "ValidationError") errObj = handleValidationErrorDB(err);
    if (err.code == 11000) errObj = handleDuplicateErrorDB(err);
    if (err.name === "JsonWebTokenError") errObj = handleJsonWebTokenError(err);
    sendErrorProd(errObj, res);
  }
};
