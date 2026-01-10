import express from "express";
import {
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/doctor.controller.js";

const router = express.Router();

router.put("/", updateAppointmentStatus);
router.get("/appointments", getAllAppointments);

export default router;
