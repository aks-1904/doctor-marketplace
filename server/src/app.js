import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
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
import Appointment from "./models/Appointment.model.js";

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
  const morgan = (await import("morgan")).default;
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
const socketIdToUserMap = new Map(); // Store user info with socket

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("room:join", async ({ email, room, userId, name, role }) => {
    try {
      // 1. Find the appointment
      const appointment = await Appointment.findOne({ roomId: room }).populate(
        "doctorId patientId"
      );

      if (!appointment) {
        socket.emit("room:error", { message: "Appointment not found" });
        return;
      }

      // 2. Check Appointment Status
      if (appointment.status === "cancelled") {
        socket.emit("room:error", {
          message: "This appointment has been cancelled",
        });
        return;
      }

      // 3. Authorization Check
      const doctorUserId = appointment.doctorId?.userId?.toString();
      const patientUserId = appointment.patientId?.userId?.toString();

      const isDoctor = doctorUserId === userId;
      const isPatient = patientUserId === userId;

      if (!isDoctor && !isPatient) {
        console.log(`⛔ Access denied for user ${userId} in room ${room}`);
        socket.emit("room:access-denied", {
          message: "You are not authorized to join this consultation.",
        });
        return;
      }

      // 4. Success - Register User
      console.log(`✅ User ${email} authorized for room ${room}`);

      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      socketIdToUserMap.set(socket.id, { email, name, role, userId });

      socket.join(room);

      // 5. Find existing peer in the room
      const clients = io.sockets.adapter.rooms.get(room);
      let remoteSocketId = null;
      let remoteUser = null;

      if (clients) {
        for (const clientId of clients) {
          if (clientId !== socket.id) {
            remoteSocketId = clientId;
            remoteUser = socketIdToUserMap.get(clientId);
            break;
          }
        }
      }

      // 6. Send Events
      // Notify the OTHER person in the room (if any)
      socket.to(room).emit("user:joined", { 
        email, 
        id: socket.id,
        name: name || email.split("@")[0]
      });

      // Notify the JOINING person (and send them the remote ID and user info)
      socket.emit("room:joined", {
        email,
        room,
        remoteSocketId,
        remoteUser
      });
    } catch (error) {
      console.error("Socket Error:", error);
      socket.emit("room:error", { message: "Internal Server Error" });
    }
  });

  /* ============================================================
     CALL EVENTS
  ============================================================ */
  socket.on("user:call", ({ to, offer }) => {
    console.log(`📞 Call from ${socket.id} to ${to}`);
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`✅ Call accepted by ${socket.id}`);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("call:busy", ({ to }) => {
    io.to(to).emit("call:busy");
  });

  /* ============================================================
     NEGOTIATION
  ============================================================ */
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log(`🔄 Negotiation needed from ${socket.id} to ${to}`);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log(`🔄 Negotiation done from ${socket.id}`);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  /* ============================================================
     ICE CANDIDATES
  ============================================================ */
  socket.on("peer:ice", ({ to, candidate }) => {
    io.to(to).emit("peer:ice", { from: socket.id, candidate });
  });

  /* ============================================================
     MEDIA TOGGLE (Camera/Mic)
  ============================================================ */
  socket.on("media:toggle", ({ room, type, enabled }) => {
    console.log(`🎥 ${socket.id} toggled ${type}: ${enabled}`);
    socket.to(room).emit("participant:media:update", {
      userId: socket.id,
      type,
      enabled
    });
  });

  /* ============================================================
     CHAT MESSAGES WITH TIMESTAMP
  ============================================================ */
  socket.on("chat:message", ({ room, message, senderName, timestamp }) => {
    const finalTimestamp = timestamp || Date.now();
    console.log(`💬 Message in ${room} from ${senderName}: ${message}`);
    
    socket.to(room).emit("chat:message", {
      senderId: socket.id,
      senderName,
      message,
      timestamp: finalTimestamp
    });
  });

  /* ============================================================
     END CALL / LEAVE
  ============================================================ */
  socket.on("doctor:end:all", ({ room }) => {
    console.log(`👨‍⚕️ Doctor ending consultation in room: ${room}`);
    socket.to(room).emit("call:ended:by:doctor");
    
    // Optional: Remove all from room
    const clients = io.sockets.adapter.rooms.get(room);
    if (clients) {
      clients.forEach(clientId => {
        io.sockets.sockets.get(clientId)?.leave(room);
      });
    }
  });

  socket.on("user:leave", ({ room, userId }) => {
    console.log(`👋 ${socket.id} leaving room: ${room}`);
    socket.to(room).emit("user:left", { id: socket.id });
    socket.leave(room);
  });

  /* ============================================================
     DISCONNECT
  ============================================================ */
  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected:", socket.id, reason);

    const email = socketIdToEmailMap.get(socket.id);
    if (email) {
      socketIdToEmailMap.delete(socket.id);
      emailToSocketIdMap.delete(email);
    }
    socketIdToUserMap.delete(socket.id);

    // Notify others in all rooms this socket was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit("user:left", { id: socket.id });
      }
    });
  });
});

export { app, httpServer };