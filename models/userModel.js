const mongoose = require("mongoose");

const userShcema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
  },
  role: {
    type: String,
    required: [true, "User must have a role"],
  },
});
const User = mongoose.model("User", userShcema);

module.exports = User;
