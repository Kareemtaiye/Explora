const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: [
      /^[\w\s_]+$/,
      "Name field must contain only character and underscore",
    ],
  },

  email: {
    type: String,
    unique: true,
    required: [true, "Please provide your email address"],
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email"],
    lower: true,
  },

  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "Password length must be atleast 8"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Password confirm field is required"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Password and password confirm are not the same",
    },
  },

  passwordChangedDate: Date,

  passwordResetToken: String,
  passwordResetTokenExpires: Date,

  photo: {
    type: String,
    default: "default.jpg",
  },

  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "admin", "lead-guide", "guide"],
      message: "Invalid 'Role' value",
    },
    select: false,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.comparePasswords = async function (
  userPassword,
  dbHashedPassword
) {
  return await bcrypt.compare(userPassword, dbHashedPassword);
};

userSchema.methods.checkForPasswordChange = function (JWTTimeStamp) {
  if (this.passwordChangedDate) {
    console.log(JWTTimeStamp < this.passwordChangedDate.getTime() / 1000);

    return JWTTimeStamp < this.passwordChangedDate.getTime() / 1000;
  }

  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 1000 * 60 * 10;

  console.log({ resetToken, passwordToken: this.passwordResetToken });

  return resetToken;
};

const User = mongoose.model("Users", userSchema);

module.exports = User;
