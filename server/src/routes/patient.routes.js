import express from "express";
import {
  bookAppointment,
  getAllAppointment,
  getDoctors,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getDoctors);
router.post("/book", bookAppointment);
router.get("/appointments", getAllAppointment);

export default router;
