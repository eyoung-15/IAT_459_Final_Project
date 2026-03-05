const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Category: {
    type: String,
  },
  Province: {
    type: String,
  },
  City: {
    type: String,
  },
  Address: {
    type: String,
  },
  Latitude: {
    type: String,
  },
  Longitude: {
    type: String,
  },
  PostalCode:{
    type: String,
  },
});

module.exports = mongoose.model("Facility", FacilitySchema);
