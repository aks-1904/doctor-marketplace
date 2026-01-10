import Appointment from "../models/Appointment.model.js";
import Doctor from "../models/Doctor.model.js";
import { v4 as uuid } from "uuid";

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    // Checking for incoming data
    if (!appointmentId) {
      res.status(400).json({
        success: false,
        message: "Appointment Id not found",
      });
      return;
    }

    // Checking for correct data
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status",
      });
      return;
    }

    // Finding appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment details not found",
      });
      return;
    }

    // Checking if requested doctor is allowed to update the status
    const doctor = await Doctor.findOne({ userId: req.user?.userId });
    if (!appointment.doctorId.equals(doctor._id)) {
      res.status(401).json({
        success: false,
        message: "You doesn't have permission to update the status",
      });
      return;
    }

    // Updating status
    appointment.status = status;

    if (status === "confirmed") {
      // Creating a room Id
      const roomId = uuid();
      appointment.roomId = roomId;
    }

    await appointment.save();

    // Success response
    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Some error occured updating while updating the appontment status",
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const doctorId = await Doctor.find({ userId });
    const appointments = await Appointment.find({ doctorId }).populate(
      "patientId"
    );

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error?.message || "Unable to get your appointments",
    });
  }
};
