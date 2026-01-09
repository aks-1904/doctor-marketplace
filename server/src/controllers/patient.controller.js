import Patient from "../models/Patient.model.js";
import Doctor from "../models/Doctor.model.js";
import Appointment from "../models/Appointment.model.js";

export const getDoctors = async (req, res) => {
  try {
    // Pagination logic
    const page = parseInt(req.query.page) || 1; // Default 1
    const limit = 10;
    const skip = (page - 1) * limit;

    // Filtering logic
    // Extract filter values from query parameters
    const {
      specialization,
      minFee,
      maxFee,
      experienceYears,
      rating,
      language,
      search,
    } = req.query;

    // Building mongoose query object
    const query = {};

    // Only show approved doctors
    query["verification.status"] = "approved";

    // Filter by specialization
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }

    // Filter by fee range
    if (minFee || maxFee) {
      query.consultaionFee = {};
      if (minFee) query.consultaionFee.$gte = Number(minFee);
      if (maxFee) query.consultaionFee.$lte = Number(maxFee);
    }

    // Filter by Experience
    if (experienceYears) {
      query.experienceYears = { $gte: Number(experienceYears) };
    }

    // Filter by rating
    if (rating) {
      query.ratingAvg = { $gte: Number(rating) };
    }

    // Filter by language
    if (language) {
      query.language = { $in: [language] };
    }

    // Database query
    const doctors = await Doctor.find(query)
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ ratingAvg: -1 }); // Sort by highest rating first

    // Get total count for frontend pagination UI
    const totalDoctors = await Doctor.countDocuments(query);

    // Send response
    res.status(200).json({
      success: true,
      count: doctors.length,
      totalPages: Math.ceil(totalDoctors / limit),
      currentPage: page,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch the doctors",
      success: false,
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, slotDate, slotTime } = req.body;

    // Fetch patient and doctor details
    const doctor = await Doctor.findById(doctorId).populate("userId");
    const patient = await Patient.findById(patientId).populate("userId");

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }
    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found",
      });
      return;
    }

    // Availability Logic

    // Determine the day of week
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateObj = new Date(slotDate);
    const dayName = daysOfWeek[dateObj.getDay()];

    // Check if doctor is available on this day
    const dayAvailability = doctor.availability.find(
      (item) => item.day === dayName
    );
    if (!dayAvailability) {
      res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayName}`,
      });
      return;
    }

    // Checking if the given time slot is within working hours
    const timeToMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const reqMinutes = timeToMinutes(slotTime);
    const startMinutes = timeToMinutes(dayAvailability.from);
    const endMinutes = timeToMinutes(dayAvailability.to);

    if (reqMinutes < startMinutes || reqMinutes >= endMinutes) {
      res.status(400).json({
        success: false,
        message: `Selected time is outside doctor's working hours (${dayAvailability.from} - ${dayAvailability.to})`,
      });
      return;
    }

    // Collision detection logic

    // Check if an appointment is already exists for this Doctor + Date + Time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      slotDate,
      slotTime,
    });
    if (existingAppointment) {
      res.status(400).json({
        success: false,
        message: "This slot is already booked, Please choose another time",
      });
      return;
    }

    // Create appointment
    const newAppointment = await Appointment.create({
      doctorId,
      slotDate,
      slotTime,
      patientId,
      amount: doctor.consultationFee,
      status: "pending", // Update by doctor
    });

    res.status(200).json({
      success: true,
      message: "Appointment Booked Successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Unable to book your appointment",
      success: false,
    });
  }
};

export const getAllAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = await Patient.find({ userId });
    const appointments = await Appointment.find({ patientId }).populate(
      "doctorId"
    );

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get all appointments",
    });
  }
};
