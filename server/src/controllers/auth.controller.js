import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import Patient from "../models/Patient.model.js";
import Doctor from "../models/Doctor.model.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,

      // patient fields
      age,
      gender,

      // doctor fields
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      licenseNumber,
      languages,
    } = req.body;
    const licenseFile = req.file;

    // Validating role
    if (!["patient", "doctor".includes(role)]) {
      res.status(403).json({
        message: "Invalid role",
        success: false,
      });
      return;
    }

    // Basic validation
    if (!name || !email || !password || !phone) {
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

      const licenseDocumentUrl = `/uploads/licenses/${licenseFile.filename}`;

      profile = await Doctor.create({
        userId: user._id,
        specialization,
        qualifications,
        experienceYears,
        consultationFee,
        verification: {
          licenseNumber,
          licenseDocumentUrl,
          status: "pending",
        },
        languages,
      });
    }

    console.log(profile);

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
    res.status(500).json({
      message: "Unable to create your account",
      success: false,
    });
    return;
  }
};
