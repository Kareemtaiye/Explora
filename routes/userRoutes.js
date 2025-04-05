const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.use(authController.protect); //Protects the routes after this line.

router.get("/me", userController.getMe);
router.patch("/update-me/", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);

router
  .route("/")
  .get(authController.restrictTo("admin"), userController.getAllUsers)
  .post(authController.restrictTo("admin"), userController.getUser);

router
  .route("/:id")
  .get(authController.restrictTo("admin"), userController.getUser)
  .patch(authController.restrictTo("admin"), userController.updateUser)
  .delete(authController.restrictTo("admin"), userController.deleteUser);

module.exports = router;
