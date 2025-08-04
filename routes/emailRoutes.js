import express from "express";
import { sendgridVariantWheels } from "../controllers/emailController.js";

const router = express.Router();

router.route("/").options(VariantWheelsAccess).post(variantSendgrid);

export default router;
