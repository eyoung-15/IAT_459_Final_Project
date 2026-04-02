const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }}, {timestamps: true}
);

module.exports = mongoose.model("Reviews", ReviewSchema);
