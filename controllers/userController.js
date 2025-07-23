import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find();
  try {
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
export const getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
export const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
export const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
export const createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.status(500).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
