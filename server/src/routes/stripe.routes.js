import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
} from "../controllers/stripe.controller.js";
const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;
