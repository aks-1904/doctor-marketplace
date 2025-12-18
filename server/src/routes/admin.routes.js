import express from "express";
import { updateVerificationStatusDoctor } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/update-verification-status", updateVerificationStatusDoctor);

export default router;
