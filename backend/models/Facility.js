const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
  },
  province: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  tags:{
    type: String,
  },
});

module.exports = mongoose.model("Facility", FacilitySchema);
