import express from "express";
import {
  homePage,
  coffeepots,
  privacyPolicy,
  termsOfService,
  loginPage,
  accountPage,
  adminPage,
  setupPage,
} from "../controllers/pageController.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.route("/").get(homePage);
router.route("/coffeepots").get(coffeepots);
router.route("/privacy-policy").get(privacyPolicy);
router.route("/terms-of-service").get(termsOfService);
router.route("/login").get(loginPage);
router
  .route("/account")
  .get(authController.protectPage, authController.sendAdminToAdmin, accountPage);
router
  .route("/admin")
  .get(
    authController.protectPage,
    authController.sendNonAdminToAccount,
    adminPage
  );
router.route("/setup").get(setupPage);

export default router;
