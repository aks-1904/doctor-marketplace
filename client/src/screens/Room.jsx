import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const videoRef = useRef(null);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const userName = "You"; // replace later if needed

  /* ---------------- USER JOIN ---------------- */
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);

  /* ---------------- START CALL ---------------- */
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  /* ---------------- ATTACH STREAM ---------------- */
  useEffect(() => {
    if (videoRef.current && myStream) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  /* ---------------- SOCKET LISTENER ---------------- */
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => socket.off("user:joined", handleUserJoined);
  }, [socket, handleUserJoined]);

  /* ---------------- TOGGLE MIC ---------------- */
  const toggleMic = () => {
    if (!myStream) return;
    myStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicOn((prev) => !prev);
  };

  /* ---------------- TOGGLE CAMERA ---------------- */
  const toggleCamera = () => {
    if (!myStream) return;
    myStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOn((prev) => !prev);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center pt-6 text-white">
      {/* Header */}
      <h1 className="text-3xl font-semibold mb-1">Room</h1>
      <p className="text-sm text-slate-400 mb-6">
        {remoteSocketId ? "Connected" : "Waiting to join"}
      </p>

      {/* Start Call */}
      {remoteSocketId && !myStream && (
        <button
          onClick={handleCallUser}
          className="mb-8 px-7 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium"
        >
          Start Call
        </button>
      )}

      {/* ---------------- VIDEO TILE ---------------- */}
      {myStream && (
        <div className="relative w-[420px] h-[280px] rounded-xl overflow-hidden bg-black shadow-2xl">
          {/* Video ALWAYS mounted */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${
              cameraOn ? "block" : "hidden"
            }`}
          />

          {/* Camera off overlay */}
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-slate-400">
              Camera Off
            </div>
          )}

          {/* Username bottom-left */}
          <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-md text-sm">
            {userName}
          </div>

          {/* Controls bottom-center */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full ${
                micOn ? "bg-slate-700" : "bg-red-600"
              }`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-2 rounded-full ${
                cameraOn ? "bg-slate-700" : "bg-red-600"
              }`}
            >
              {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
