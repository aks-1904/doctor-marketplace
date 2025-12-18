import Doctor from "../models/Doctor.model";

export const verifyDoctor = async (req, res) => {
  try {
    const { doctorId, updatedVerificationStatus } = req.body;

    // Basic validation
    if (!["approved", "rejected"].includes(updatedVerificationStatus)) {
      res.status(400).json({
        message: "Invalid verification status",
        success: false,
      });
      return;
    }
    if (!doctorId) {
      res.status(400).json({
        message: "Invalid Doctor Id",
        success: false,
      });
      return;
    }

    const doctor = await Doctor.find({ userId: doctorId });

    // Checking doctor account exists
    if (!doctor) {
      res.status(400).json({
        message: "Doctor not found",
        success: false,
      });
      return;
    }

    doctor.verification.status = updatedVerificationStatus;
    await doctor.save();

    res.status(200).json({
      message: "Doctor Status updated",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update doctor verification status",
      success: false,
    });
  }
};
