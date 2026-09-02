import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 90 * 24 * 60 * 60 * 1000,
  secure: true,
});

const sendAuth = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions());
  res.status(statusCode).json({
    status: "success",
    data: {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

const authController = {
  setupAdmin: catchAsync(async (req, res, next) => {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return next(new AppError("Admin already exists.", 403));
    }
    const { name, email, password, passwordConfirm } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password.", 400));
    }
    const user = await User.create({
      name: name || "Admin",
      email,
      password,
      passwordConfirm,
      role: "admin",
    });
    sendAuth(user, 201, res);
  }),

  signup: catchAsync(async (req, res, next) => {
    const user = await User.create({
      name: req.body.name,
      email: String(req.body.email || "").toLowerCase(),
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: "user",
    });
    sendAuth(user, 201, res);
  }),

  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password.", 400));
    }
    const user = await User.findOne({
      email: String(email).toLowerCase(),
    }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password.", 401));
    }
    sendAuth(user, 200, res);
  }),

  logout: (req, res) => {
    res.cookie("jwt", "loggedout", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1000,
    });
    res.status(200).json({ status: "success" });
  },

  protect: catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (
      req.cookies &&
      req.cookies.jwt &&
      req.cookies.jwt !== "loggedout"
    ) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(new AppError("Please log in.", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists.", 401));
    }
    req.user = user;
    next();
  }),

  restrictTo:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError("You do not have permission.", 403));
      }
      next();
    },

  me: catchAsync(async (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }),

  adminOverview: catchAsync(async (req, res) => {
    const users = await User.find().select("name email role");
    res.status(200).json({
      status: "success",
      data: { users },
    });
  }),
};

export default authController;
