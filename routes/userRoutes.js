import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/userController.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/setup", authController.setupAdmin);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authController.protect, authController.me);
router.get(
  "/admin-overview",
  authController.protect,
  authController.restrictTo("admin"),
  authController.adminOverview
);

router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
