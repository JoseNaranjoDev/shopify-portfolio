import { listUsers, createUser } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAllUsers = catchAsync(async (req, res) => {
  const users = listUsers();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
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
export const createUserHandler = catchAsync(async (req, res) => {
  const newUser = await createUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role === "admin" ? "admin" : "user",
  });

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
});

export { createUserHandler as createUser };
