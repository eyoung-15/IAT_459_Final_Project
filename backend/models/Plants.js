const mongoose = require("mongoose");

const PlantSchema = new mongoose.Schema({
  commonName: {
    type: String,
    default: "Unknown Plant",
  },
  family: {
    type: String,
  },
  category: {
    type: String,
  },
  origin: {
    type: String,
  },
  climate: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
});

module.exports = mongoose.model("Plant", PlantSchema);
