import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    from: {
      type: String, // "10:00"
      required: true,
    },
    to: {
      type: String, // "14:00"
      required: true,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: [String],
      required: true,
    },

    qualifications: {
      type: [String],
      required: true,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    consultationFee: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    languages: {
      type: [String],
      default: ["English"],
    },

    availability: {
      type: [availabilitySchema],
      default: [],
    },

    verification: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      licenseNumber: {
        type: String,
        required: true,
      },
      licenseDocumentUrl: {
        type: String,
        required: true,
      },
      verifiedAt: {
        type: Date,
      },
      rejectedReason: {
        type: String,
      },
    },

    stripeAccountId: {
      type: String,
    },

    ratingAvg: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Doctor", doctorSchema);
