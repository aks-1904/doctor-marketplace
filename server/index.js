import express from "express";
import { Server } from "socket.io";

const SOCKET_PORT = process.env.SOCKET_PORT;

const io = new Server(SOCKET_PORT, {
  cors: process.env.CLIENT_URL,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {

  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  /* -------- CALL EVENTS -------- */
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", {
      from: socket.id,
      offer,
    });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", {
      from: socket.id,
      ans,
    });
  });

  /* -------- NEGOTIATION -------- */
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", {
      from: socket.id,
      offer,
    });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", {
      from: socket.id,
      ans,
    });
  });

  /* ================== ICE CANDIDATES  ================== */
  socket.on("peer:ice", ({ to, candidate }) => {
    io.to(to).emit("peer:ice", {
      from: socket.id,
      candidate,
    });
  });

  socket.on("call:busy", ({ to }) => {
    io.to(to).emit("call:busy");
  });
});
