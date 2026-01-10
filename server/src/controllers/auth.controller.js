import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import Patient from "../models/Patient.model.js";
import Doctor from "../models/Doctor.model.js";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import adminModel from "../models/admin.model.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      gender,

      // patient fields
      age,

      // doctor fields
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      licenseNumber,
      languages,
      availability,
    } = req.body;
    const licenseFile = req.file;

    // Validating role
    if (!["patient", "doctor"].includes(role)) {
      res.status(403).json({
        message: "Invalid role",
        success: false,
      });
      return;
    }

    // Basic validation
    if (!name || !email || !password || !phone || !gender) {
      res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
      return;
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      res.status(409).json({
        message: "User already exists with email or phone",
        success: false,
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create base user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
    });

    // Create role profile
    let profile = null;
    if (role === "patient") {
      profile = await Patient.create({
        userId: user._id,
        age,
        gender,
      });
    } else if (role === "doctor") {
      // Strict doctor validation
      if (
        !specialization ||
        !qualifications ||
        !experienceYears ||
        !consultationFee ||
        !licenseNumber ||
        !licenseFile
      ) {
        await User.findByIdAndDelete(user._id);

        res.status(400).json({
          message: "Incomplete doctor registration data",
        });
        return;
      }

      // Normalize availability
      let doctorAvailability = [];
      if (availability) {
        const availabilityArr = Array.isArray(availability)
          ? availability
          : [availability];

        doctorAvailability = availabilityArr.map((slot) => ({
          day: slot.day,
          from: slot.from,
          to: slot.to,
        }));

        // Strick validation
        for (const slot of doctorAvailability) {
          if (!slot.day || !slot.from || !slot.to) {
            await User.findByIdAndDelete(user._id);
            res.status(400).json({
              success: false,
              message: "Invalid availability data",
            });
            return;
          }
        }
      }

      const licenseDocumentUrl = `/uploads/licenses/${licenseFile.filename}`;

      profile = await Doctor.create({
        userId: user._id,
        specialization,
        qualifications,
        experienceYears,
        consultationFee,
        availability: doctorAvailability,
        verification: {
          licenseNumber,
          licenseDocumentUrl,
          status: "pending",
        },
        languages,
        gender,
      });
    }

    // Success Response
    res.status(201).json({
      message: "Registration successfull",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to create your account",
      success: false,
    });
    return;
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        message: "Email and password is required",
        success: false,
      });
      return;
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
      return;
    }

    // Checking if user id blocked or not
    if (user.isBlocked) {
      res.status(403).json({
        message: "You cannot access your account",
        success: false,
      });
      return;
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
      return;
    }

    // Load profile
    let profile = null;
    if (user.role === "patient") {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === "doctor") {
      profile = await Doctor.findOne({ userId: user._id });

      // Send message to rejected doctors
      if (profile.verification.status === "rejected") {
        res.status(401).json({
          success: false,
          message: `Your profile has been rejected because of ${profile.verification.rejectedReason}`,
        });
        return;
      }
      // Block unverified doctors
      else if (profile.verification.status !== "approved") {
        res.status(403).json({
          message: "Doctor account is not verified yet",
          success: false,
        });
        return;
      }
    } else if (user.role === "admin") {
      profile = await Admin.findOne({ userId: user._id });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Getting user without passwordHash
    const userObj = user.toObject();
    const { passwordHash: _, ...userWithoutPass } = userObj;

    // Success Response
    res.status(200).json({
      message: "Login successfull",
      user: userWithoutPass,
      profile,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      success: false,
    });
  }
};

export const logout = async (_, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
};
