import express from "express";
import {
  homePage,
  coffeepots,
  privacyPolicy,
  termsOfService,
} from "../controllers/pageController.js";

const router = express.Router();

router.route("/").get(homePage);
router.route("/coffeepots").get(coffeepots);
router.route("/privacy-policy").get(privacyPolicy);
router.route("/terms-of-service").get(termsOfService);

export default router;
