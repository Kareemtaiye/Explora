const express = require("express");
const reviewController = require("../controllers/reviewsController");
const authController = require("./../controllers/authcontroller");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo("user"), reviewController.createReview);

router
  .route("/:id")
  .delete(authController.restrictTo("admin"), reviewController.deleteReview)
  .get(reviewController.getReview)
  .patch(reviewController.UpdateReview);

module.exports = router;
