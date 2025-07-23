import express from "express";
import { getGelatoInstagramToken } from "../controllers/tokenController.js";

const router = express.Router();

router.route("/gelato-instagram-feed").get(getGelatoInstagramToken);

export default router;
