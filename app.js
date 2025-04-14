const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitizer = require("express-mongo-sanitize");
const cors = require("cors");

const handleUnhandledRoutes = require("./middleware/unhandledRoutes");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewsRoutes");

const app = express();

// GLOBAL MIDDLEWARE
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, please try again in an hour",
});

app.use(cors());
app.options("*", cors());

// Security headers
app.use(helmet());

//Sanitizes Users' inputs
app.use(mongoSanitizer());

// Prevents Parameter Pollutions
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

// Limits the number of requests
app.use("/api", limiter);

if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}

// Parsed the incoming data
app.use(express.json({ limit: "10kb" }));

// Router Middlewares
app.use("/api/v2/tours", tourRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/reviews", reviewRouter);

// All routes that are not defined on our server
app.use("*", handleUnhandledRoutes);

// Handles all errors globally
app.use(globalErrorHandler);

module.exports = app;
