import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  }),
  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    const token = "";
    res.status(200).json({
      status: "success",
      token,
    });
  }),
  // Add other auth-related functions here if needed, e.g., login, logout
};

export default authController;
