const fs = require("fs");
const members = JSON.parse(fs.readFileSync("./members.json"));

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    results: members.length,
    data: {
      members,
    },
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is yet not defined!",
  });
};
