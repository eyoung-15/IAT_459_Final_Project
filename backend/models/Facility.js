const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // points to the User collection
    required: true,
  },
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
    type: Number,
  },
  Longitude: {
    type: Number, 
  },
  PostalCode:{
    type: String,
  },
  lastReviewImage: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Facility", FacilitySchema);
