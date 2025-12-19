import express from "express";
import { getDoctors } from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getDoctors);

export default router;
