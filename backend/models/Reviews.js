const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true
  },
  username: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }}, {timestamps: true}
);

module.exports = mongoose.model("Reviews", ReviewSchema);
