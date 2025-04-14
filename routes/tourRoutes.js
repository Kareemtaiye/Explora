const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authcontroller");
const reviewRouter = require("./reviewsRoutes");

const router = express.Router();

router
  .route("/5-cheap-best-tours")
  .get(tourController.getCheapBestTour, tourController.getAllTours);

router
  .route("/tour-stats")
  .get(
    authController.restrictTo("admin", "guide", "lead-guide"),
    tourController.getTourStats
  );
router.route("/tour-stats/:year").get(tourController.getToursInYear);
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router
  .route("/distances/:latlng/unit/:unit")
  .get(tourController.getToursDistance);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin, lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.deleteTour
  );

router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
