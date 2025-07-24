import express from "express";
import { homePage, coffeepots } from "../controllers/pageController.js";

const router = express.Router();

router.route("/").get(homePage);
router.route("/coffeepots").get(coffeepots);

export default router;
