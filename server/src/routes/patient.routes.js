import express from "express";
import {
  bookAppointment,
  getDoctors,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getDoctors);
router.post("/book", bookAppointment);

export default router;
