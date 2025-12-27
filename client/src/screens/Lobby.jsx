import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  useEffect(() => {
    socket.on("room:joined", handleJoinRoom);
    return () => {
      socket.off("room:joined", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <form onSubmit={handleSubmitForm}>
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-green-500 p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
              {" "}
              Meeting Lobby
            </h1>
            <p className="text-center text-gray-500 mb-6">
              Secure consultation room
            </p>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl m-2 border focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
              type="text"
              placeholder="Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-3 m-2 rounded-xl border focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              onClick={handleSubmitForm}
              className="w-full bg-linear-to-r m-2 from-blue-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Join Room
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Lobby;
