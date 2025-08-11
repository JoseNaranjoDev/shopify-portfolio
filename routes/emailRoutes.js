import express from "express";
import {
  VariantWheelsAccess,
  variantSendgrid,
  contactFormEmail,
} from "../controllers/emailController.js";

const router = express.Router();

router.route("/").options(VariantWheelsAccess).post(variantSendgrid);
router.route("/homepagecontactform").post(contactFormEmail);

export default router;
