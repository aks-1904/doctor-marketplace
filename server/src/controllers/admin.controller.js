import Doctor from "../models/Doctor.model.js";
import User from "../models/User.model.js";
import Patient from "../models/Patient.model.js";

export const updateVerificationStatusDoctor = async (req, res) => {
  try {
    const { doctorId, updatedVerificationStatus, rejectedReason } = req.body;

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

    let doctor = await Doctor.findOne({ userId: doctorId });

    // Checking doctor account exists
    if (!doctor) {
      res.status(400).json({
        message: "Doctor not found",
        success: false,
      });
      return;
    }

    // If doctor verification is rejected
    if (updatedVerificationStatus === "rejected") {
      // Checking for rejected reason
      if (!rejectedReason) {
        res.status(400).json({
          success: false,
          message: "Rejected reason required",
        });
        return;
      }
      doctor.verification.rejectedReason = rejectedReason;
    }
    doctor.verification.status = updatedVerificationStatus;
    await doctor.save();

    doctor = await Doctor.findOne({ userId: doctorId }).populate("userId");

    res.status(200).json({
      message: "Doctor Status updated",
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update doctor verification status",
      success: false,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({
        message: "User Id not found",
        success: false,
      });
      return;
    }

    const user = await User.findById(userId);
    // Checking for user existense
    if (!user) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
      return;
    }
    // Blocking user
    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      message: "Blocked user",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to block the user",
      success: false,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({
        message: "User Id not found",
        success: false,
      });
      return;
    }

    const user = await User.findById(userId);
    // Checking for user existense
    if (!user) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
      return;
    }
    // Blocking user
    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      message: "Unblocked user",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to unblock the user",
      success: false,
    });
  }
};

export const getAllUnverifiedDoctor = async (req, res) => {
  try {
    // Get all doctors whose verification is pending
    const doctors = await Doctor.find({
      "verification.status": "pending",
    })
      .populate("userId")
      .select("-userId.passwordHash");

    // Success response
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot get unverified doctors",
    });
  }
};

export const getAllApprovedDoctor = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      "verification.status": "approved",
    }).populate("userId");

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get approved doctors",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "patient" });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get all users",
    });
  }
};
