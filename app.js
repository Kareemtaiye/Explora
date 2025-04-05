const express = require("express");
const morgan = require("morgan");

const handleUnhandledRoutes = require("./middleware/unhandledRoutes");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewsRoutes");

const app = express();

if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v2/tours", tourRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/reviews", reviewRouter);

app.use("*", handleUnhandledRoutes);

app.use(globalErrorHandler);

module.exports = app;
