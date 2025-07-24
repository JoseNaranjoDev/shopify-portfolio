import User from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  }),
  // Add other auth-related functions here if needed, e.g., login, logout
};

export default authController;
