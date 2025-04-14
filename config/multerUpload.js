const AppError = require("../utilities/AppError");

const multer = require("multer");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     const uniqueSuffix = req.user._id + "-" + Date.now();

//     cb(null, `user-${uniqueSuffix}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    console.log(file.mimetype.startsWith("image"));
    cb(new AppError("Not an image, Please upload image only.", 400), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload;
