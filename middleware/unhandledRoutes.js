const AppError = require("../utilities/AppError");

module.exports = (req, res, next) => {
  // const err = new Error(`Cannot find ${req.originalUrl} on the server`);
  // err.statusCode = 404;

  next(new AppError(`Cannot find ${req.originalUrl} on the server`, 404));
};
