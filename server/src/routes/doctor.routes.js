import express from "express";
import { updateAppointmentStatus } from "../controllers/doctor.controller.js";

const router = express.Router();

router.put("/", updateAppointmentStatus);

export default router;
