import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    permissions: {
      type: [String],
      default: ["VERIFY_DOCTOR", "BLOCK_USER", "REFUND_PAYMENT"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
