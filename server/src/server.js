import dotenv from "dotenv";
dotenv.config();

import { httpServer } from "./app.js";
import connectDB from "./config/db.js";

const REQUIRED_ENV = ["PORT", "MONGO_URI"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing env: ${key}`);
    process.exit(1);
  }
});

await connectDB();

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://192.168.1.9:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  httpServer.close(() => process.exit(0));
});
