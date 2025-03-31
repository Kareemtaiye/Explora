const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router
  .route("/5-cheap-best-tours")
  .get(tourController.getCheapBestTour, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/tour-stats/:year").get(tourController.getToursInYear);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.deleteTour
  );

module.exports = router;
