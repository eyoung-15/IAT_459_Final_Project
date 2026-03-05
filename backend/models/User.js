const mongoose = require("mongoose");

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
  // visited: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility"}],
  // bucketList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility"}]
});

module.exports = mongoose.model("User", UserSchema);