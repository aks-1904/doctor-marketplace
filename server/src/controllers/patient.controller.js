import Doctor from "../models/Doctor.model.js";

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
