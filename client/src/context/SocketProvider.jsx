import React, { createContext, useContext, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return socket;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  // create socket synchronously ONCE
  if (!socketRef.current) {
    socketRef.current = io(import.meta.env.VITE_BACKEND_SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });
  }

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
