import React, { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";

const Lobby = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket=useSocket();

  const handleJoinRoom=useCallback((data)=>{
    const{name,email,room}=data;
  },[])

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { name, email, room });
    },
    [name, email, room, socket]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return ()=>{
      socket.off("room:join",handleJoinRoom);
    }
  }, [socket,handleJoinRoom]);

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

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="text"
                placeholder="Room ID"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-400 outline-none"
              />
              <button className="w-full bg-linear-to-r from-blue-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition">
                Join Room
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Lobby;
