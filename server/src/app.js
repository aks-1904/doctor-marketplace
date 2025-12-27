import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import {
  authenticateUser,
  authorizeRoles,
} from "./middlewares/auth.middleware.js";

const app = express();

/* =======================
   Middlewares
======================= */
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =======================
   Routes
======================= */
app.get("/health", (_, res) =>
  res.json({ status: "OK", uptime: process.uptime() })
);

app.use("/api/v1/auth", authRoutes);
app.use(
  "/api/v1/admin",
  authenticateUser,
  authorizeRoles("admin"),
  adminRoutes
);
app.use(
  "/api/v1/patient",
  authenticateUser,
  authorizeRoles("admin", "patient"),
  patientRoutes
);
app.use(
  "/api/v1/doctor",
  authenticateUser,
  authorizeRoles("admin", "doctor"),
  doctorRoutes
);

/* =======================
   HTTP + SOCKET
======================= */
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    methods: ["GET", "POST"],
  },
});

/* =======================
   Socket Logic
======================= */
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("room:join", ({ email, room }) => {
    console.log("h");
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    socket.join(room);

    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.emit("room:joined", { email, room });
  });

  socket.on("user:call", ({ to, offer }) =>
    io.to(to).emit("incoming:call", { from: socket.id, offer })
  );

  socket.on("call:accepted", ({ to, ans }) =>
    io.to(to).emit("call:accepted", { from: socket.id, ans })
  );

  socket.on("peer:nego:needed", ({ to, offer }) =>
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer })
  );

  socket.on("peer:nego:done", ({ to, ans }) =>
    io.to(to).emit("peer:nego:final", { from: socket.id, ans })
  );

  socket.on("peer:ice", ({ to, candidate }) =>
    io.to(to).emit("peer:ice", { from: socket.id, candidate })
  );

  socket.on("call:busy", ({ to }) => io.to(to).emit("call:busy"));

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", socket.id, reason);

    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      socketIdToEmailMap.delete(socket.id);
      emailToSocketIdMap.delete(email);
    }
  });
});

export { app, httpServer };
