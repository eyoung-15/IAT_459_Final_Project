const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  facilityId: {
    type: String,
  },
  username: {
    type: String,
  },
  rating: {
    type: Number,
  },
  comment: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  }}, {timestamps: true}
);

module.exports = mongoose.model("Reviews", ReviewSchema);
