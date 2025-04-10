const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitizer = require("express-mongo-sanitize");
const handleUnhandledRoutes = require("./middleware/unhandledRoutes");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewsRoutes");

const app = express();
// GLOBAL MIDDLEWARE
const limiter = rateLimit({
  max: 2,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, please try again in an hour",
});

app.use(helmet());
app.use(mongoSanitizer());
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "ratingsAverage",
      "ratingsQuantity",
      "price",
      "difficulty",
    ],
  })
);

app.use("/api", limiter);

if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use("/api/v2/tours", tourRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/reviews", reviewRouter);

app.use("*", handleUnhandledRoutes);

app.use(globalErrorHandler);

module.exports = app;
