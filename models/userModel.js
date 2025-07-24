import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userShcema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a Username"],
    maxlength: [38, "Username must have less than 38 characters"],
    minLength: [3, "Username must have more than 10 characters"],
    //validate: [validator.isAlpha, "User name must only contain characters"],
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password must be minimum of 8 characters"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "admin"],
      message: "Role must be either 'user' or 'admin'",
    },
    required: [true, "User must have a role"],
  },
});

userShcema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model("User", userShcema);

export default User;
