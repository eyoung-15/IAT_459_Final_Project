const mongoose = require("mongoose");

const visitedSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    visitedAt: {type: Date, default: Date.now},
    image: String,
  });

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member"

  },
  visited: [visitedSchema],
  bucketList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility"}],
});

module.exports = mongoose.model("User", UserSchema);