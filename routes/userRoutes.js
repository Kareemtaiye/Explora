const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/me", authController.protect, userController.getMe);
router.patch("/update-me/", authController.protect, userController.updateMe);
router.delete("/delete-me", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  )
  .post(authController.protect, userController.getUser);

router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
