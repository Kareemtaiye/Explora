const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Missing tour name"],
    unique: true,
    trim: true,
    minLength: [10, "Minimum length of tour name must be 10"],
    maxLength: [50, "Maximum length of tour name must be 50"],
    validate: {
      validator: function (val) {
        return /^[A-Za-z\s]+$/.test(val);
      },
      message: "Tour name must contain only characters",
    },
  },

  vipTour: {
    type: Boolean,
    default: false,
  },

  difficulty: {
    type: String,
    required: [true, "Difficulty is required for a tour"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message:
        "Invalid value for tour difficulty. Use (easy, medium, or difficult)",
    },
  },

  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have maximum group size"],
  },

  price: {
    type: Number,
    required: [true, "Missing tour price"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "Price value must be positive",
    },
  },

  description: {
    type: String,
    require: [true, "Missing tour description"],
  },

  ratings: {
    type: Number,
    min: [0, "Ratings must not be less than zero"],
    max: [5, "The maximum ratings must not be more than be zero"],
  },

  ratingsQuantity: { type: Number, default: 0 },

  ratingsAverage: { type: Number, default: 4.0 },

  discount: {
    type: Number,
    validate: [
      function (val) {
        return val <= this.price;
      },
      "Discount value must not be higher than price value",
    ],
  },

  summary: {
    type: String,
    unique: true,
    required: [true, "Missing tour summary"],
  },

  slug: String,

  imageCover: String,

  startDates: [Date],
  startLocation: {
    type: {
      type: String,
      defult: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },

  locations: [
    {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],

  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  images: [String],
  slug: String,
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// tourSchema.virtual("totalRatingsSum").get(function () {
//   return this.ratingsAverage * this.ratingsQuantity;
// });

// tourSchema.methods.calcRatingsData = function (userId, ratingsl) {

// };

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre("insertMany", async function (next, docs) {
  docs.forEach(doc => {
    doc.slug = slugify(doc.name, { lower: true });
  });
  next();
});

tourSchema.pre(/^findOne/g, function (next) {
  this.find({ vipTour: { $ne: true } }).populate({
    path: "guides",
    select: "name photo email",
  });
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: { vipTour: { $ne: true } },
  });

  this.pipeline().forEach((pipeline, ind) => {
    if (Object.keys(pipeline)[0].includes("geoNear")) {
      this.pipeline().splice(ind, 1);
      this.pipeline().unshift(pipeline);
    }
    // console.log(this.pipeline());⁄
  });
  next();
});

const Tour = mongoose.model("Tours", tourSchema);

module.exports = Tour;
