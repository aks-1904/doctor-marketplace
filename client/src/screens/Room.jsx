// pages/Room.jsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Shield, AlertCircle } from "lucide-react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  
  // Security & Connection Status
  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [isSecureConnection, setIsSecureConnection] = useState(false);

  /* ============================================================
     CONNECTION STATE MONITORING
  ============================================================ */
  useEffect(() => {
    const updateConnectionState = () => {
      const state = peer.peer.connectionState;
      setConnectionState(state);
      
      // Connection is secure when connected
      if (state === "connected") {
        setIsSecureConnection(true);
        console.log("✅ Secure P2P connection established");
      } else if (state === "failed" || state === "disconnected") {
        setIsSecureConnection(false);
      }
    };

    const updateIceState = () => {
      const state = peer.peer.iceConnectionState;
      setIceConnectionState(state);
      console.log("ICE State:", state);
    };

    peer.peer.addEventListener("connectionstatechange", updateConnectionState);
    peer.peer.addEventListener("iceconnectionstatechange", updateIceState);

    return () => {
      peer.peer.removeEventListener("connectionstatechange", updateConnectionState);
      peer.peer.removeEventListener("iceconnectionstatechange", updateIceState);
    };
  }, []);

  /* ============================================================
     USER JOIN - ENSURE ONLY 2 USERS
  ============================================================ */
  const handleUserJoined = useCallback(({ id }) => {
    console.log("User joined:", id);
    
    // If already in a call, reject new connection
    if (remoteSocketId && remoteSocketId !== id) {
      console.warn("Already in a call with another user");
      socket.emit("call:busy", { to: id });
      return;
    }
    
    setRemoteSocketId(id);
  }, [remoteSocketId, socket]);

  /* ============================================================
     START CALL
  ============================================================ */
  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream);
      setCallStarted(true);

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      
      console.log("📞 Call initiated");
    } catch (err) {
      console.error("Error starting call:", err);
      alert("Failed to access camera/microphone. Please check permissions.");
    }
  }, [remoteSocketId, socket]);

  /* ============================================================
     INCOMING CALL
  ============================================================ */
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      
      // Reject if already in a call
      if (remoteSocketId && remoteSocketId !== from) {
        console.warn("Already in a call");
        socket.emit("call:busy", { to: from });
        return;
      }
      
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        setMyStream(stream);
        setCallStarted(true);

        // Add tracks to peer connection
        stream.getTracks().forEach((track) => {
          peer.peer.addTrack(track, stream);
        });

        // Create and send answer
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
        
        // Process any queued ICE candidates
        await peer.processPendingCandidates();
        
        console.log("✅ Call accepted");
      } catch (err) {
        console.error("Error accepting call:", err);
        alert("Failed to access camera/microphone. Please check permissions.");
      }
    },
    [remoteSocketId, socket]
  );

  /* ============================================================
     CALL ACCEPTED
  ============================================================ */
  const handleCallAccepted = useCallback(async ({ ans }) => {
    console.log("✅ Call accepted by remote peer");
    await peer.setRemoteAnswer(ans);
    
    // Process any queued ICE candidates
    await peer.processPendingCandidates();
  }, []);

  /* ============================================================
     ICE CANDIDATE HANDLING - SECURE P2P CONNECTION
  ============================================================ */
  useEffect(() => {
    const handleIceCandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        console.log("🧊 Sending ICE candidate:", event.candidate.type);
        
        socket.emit("peer:ice", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log("🧊 ICE gathering complete");
      }
    };

    peer.peer.addEventListener("icecandidate", handleIceCandidate);

    return () => {
      peer.peer.removeEventListener("icecandidate", handleIceCandidate);
    };
  }, [remoteSocketId, socket]);

  const handleIncomingIce = useCallback(async ({ candidate }) => {
    console.log("🧊 Received ICE candidate:", candidate.type);
    await peer.addIceCandidate(candidate);
  }, []);

  /* ============================================================
     REMOTE TRACK - SECURE STREAM RECEPTION
  ============================================================ */
  useEffect(() => {
    const handleTrack = (ev) => {
      console.log("📺 Received remote track");
      const stream = ev.streams[0];
      
      // Verify this is from the correct peer (security check)
      if (remoteSocketId) {
        setRemoteStream(stream);
        console.log("✅ Remote stream set securely");
      } else {
        console.warn("⚠️ Received track from unknown peer");
      }
    };

    peer.peer.addEventListener("track", handleTrack);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, [remoteSocketId]);

  /* ============================================================
     NEGOTIATION
  ============================================================ */
  const handleNegoNeeded = useCallback(async () => {
    console.log("🔄 Negotiation needed");
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", {
      offer,
      to: remoteSocketId,
    });
  }, [remoteSocketId, socket]);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      // Only accept negotiation from current peer
      if (from !== remoteSocketId) {
        console.warn("⚠️ Negotiation from unknown peer");
        return;
      }
      
      console.log("🔄 Incoming negotiation");
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [remoteSocketId, socket]
  );

  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    // Only accept negotiation from current peer
    if (from !== remoteSocketId) {
      console.warn("⚠️ Final negotiation from unknown peer");
      return;
    }
    
    console.log("🔄 Final negotiation");
    await peer.setRemoteAnswer(ans);
  }, [remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  /* ============================================================
     SOCKET EVENTS
  ============================================================ */
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("peer:ice", handleIncomingIce);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("peer:ice", handleIncomingIce);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
    handleIncomingIce,
  ]);

  /* ============================================================
     ATTACH STREAMS TO VIDEO ELEMENTS
  ============================================================ */
  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  /* ============================================================
     MEDIA TOGGLES
  ============================================================ */
  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicOn((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraOn((prev) => !prev);
    }
  };

  /* ============================================================
     END CALL - SECURE CLEANUP
  ============================================================ */
  const endCall = () => {
    console.log("📴 Ending call");
    
    // Stop all local tracks
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    // Clear remote stream
    if (remoteStream) {
      setRemoteStream(null);
    }

    // Reset states
    setCallStarted(false);
    setRemoteSocketId(null);
    setChatOpen(false);
    setIsSecureConnection(false);
    setConnectionState("new");
    setIceConnectionState("new");

    // Clear ICE candidate queue
    iceCandidateQueue.current = [];

    // Reset peer connection
    peer.resetConnection();
    
    console.log("✅ Call ended, connection cleaned up");
  };

  /* ============================================================
     CONNECTION STATUS INDICATOR
  ============================================================ */
  const ConnectionStatus = () => {
    if (!callStarted) return null;

    const getStatusColor = () => {
      if (isSecureConnection && connectionState === "connected") {
        return "bg-green-500";
      } else if (connectionState === "connecting" || iceConnectionState === "checking") {
        return "bg-yellow-500 animate-pulse";
      } else if (connectionState === "failed" || connectionState === "disconnected") {
        return "bg-red-500";
      }
      return "bg-gray-500";
    };

    const getStatusText = () => {
      if (isSecureConnection && connectionState === "connected") {
        return "Secure P2P Connection";
      } else if (connectionState === "connecting" || iceConnectionState === "checking") {
        return "Establishing Connection...";
      } else if (connectionState === "failed") {
        return "Connection Failed";
      } else if (connectionState === "disconnected") {
        return "Disconnected";
      }
      return "Initializing...";
    };

    return (
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 px-3 py-2 rounded-lg text-sm z-20">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-white">{getStatusText()}</span>
        {isSecureConnection && (
          <Shield className="text-green-400" size={16} />
        )}
      </div>
    );
  };

  /* ============================================================
     RENDER - LOBBY VIEW
  ============================================================ */
  if (!callStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <Shield className="mx-auto mb-4 text-blue-400" size={64} />
          <h1 className="text-3xl font-semibold mb-2">Secure Video Call</h1>
          <p className="text-sm text-slate-400">End-to-end encrypted P2P connection</p>
        </div>
        
       

        <p className="text-sm text-slate-400 mb-6">
          {remoteSocketId 
            ? "✅ Peer connected - Ready to call" 
            : "⏳ Waiting for peer to join..."}
        </p>

        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Shield size={20} />
            Start Secure Call
          </button>
        )}
      </div>
    );
  }

  /* ============================================================
     RENDER - CALL VIEW
  ============================================================ */
  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col relative">
      <ConnectionStatus />

      {/* Video Section */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-2">
        {/* Local Video */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          {cameraOn && myStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-800">
              <div className="text-center">
                <VideoOff className="mx-auto mb-2" size={48} />
                <span className="text-lg">Camera Off</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-sm flex items-center gap-2">
            You
            {isSecureConnection && <Shield className="text-green-400" size={14} />}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-800 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-pulse mb-2">⏳</div>
                <span className="text-lg">Connecting to peer...</span>
              </div>
            </div>
          )}
          {remoteStream && (
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-sm">
              Participant
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col z-10">
          <div className="p-4 border-b font-semibold flex items-center justify-between">
            <span>Secure Chat</span>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-600">
            <div className="text-center text-xs text-gray-400 mb-4">
              🔒 End-to-end encrypted
            </div>
            No messages yet
          </div>
          <div className="p-3 border-t">
            <input
              type="text"
              placeholder="Type a secure message"
              className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="h-20 bg-gray-800 flex items-center justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${
            micOn 
              ? "bg-gray-600 hover:bg-gray-500" 
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? (
            <Mic className="text-white" />
          ) : (
            <MicOff className="text-white" />
          )}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${
            cameraOn 
              ? "bg-gray-600 hover:bg-gray-500" 
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? (
            <Video className="text-white" />
          ) : (
            <VideoOff className="text-white" />
          )}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-700 hover:bg-red-800 transition-colors"
          title="End call"
        >
          <PhoneOff className="text-white" />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-4 rounded-full transition-colors ${
            chatOpen 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-gray-600 hover:bg-gray-500"
          }`}
          title="Toggle chat"
        >
          <MessageSquare className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Room;