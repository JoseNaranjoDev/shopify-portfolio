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

const router = express.Router();

router.route("/").get(homePage);
router.route("/coffeepots").get(coffeepots);
router.route("/privacy-policy").get(privacyPolicy);
router.route("/terms-of-service").get(termsOfService);
router.route("/login").get(loginPage);
router.route("/account").get(accountPage);
router.route("/admin").get(adminPage);
router.route("/setup").get(setupPage);

export default router;
