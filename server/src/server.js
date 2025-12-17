import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";

const REQUIRED_ENV = ["PORT", "MONGO_URI"];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

await connectDB();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});
