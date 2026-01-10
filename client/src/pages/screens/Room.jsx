import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Shield,
} from "lucide-react";
import peer from "../../service/peer";
import { useSocket } from "../../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const negoInProgress = useRef(false);
  const hasJoined = useRef(false); // Prevents double join in Strict Mode

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [isSecureConnection, setIsSecureConnection] = useState(false);

  /* ============================================================
     1. AUTOMATIC JOIN & AUTHENTICATION
  ============================================================ */
  useEffect(() => {
    if (!socket || !user || hasJoined.current) return;

    // Mark as joined to prevent duplicate emissions in React StrictMode
    hasJoined.current = true;

    console.log("🔒 Attempting to join secure room:", roomId);
    socket.emit("room:join", {
      email: user.email,
      room: roomId,
      userId: user._id,
    });

    const handleRoomJoined = ({ remoteSocketId }) => {
      console.log("✅ Joined Room. Remote Peer ID:", remoteSocketId);
      // If the backend sends a remoteSocketId, it means someone is already here.
      if (remoteSocketId) {
        setRemoteSocketId(remoteSocketId);
      }
    };

    const handleUserJoined = ({ email, id }) => {
      console.log(`👤 User joined: ${email} (${id})`);
      setRemoteSocketId(id);
    };

    const handleAccessDenied = ({ message }) => {
      alert(message);
      navigate("/");
    };

    const handleRoomError = ({ message }) => {
      alert(message);
      navigate("/");
    };

    socket.on("room:joined", handleRoomJoined);
    socket.on("user:joined", handleUserJoined);
    socket.on("room:access-denied", handleAccessDenied);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("room:joined", handleRoomJoined);
      socket.off("user:joined", handleUserJoined);
      socket.off("room:access-denied", handleAccessDenied);
      socket.off("room:error", handleRoomError);
      hasJoined.current = false;
    };
  }, [socket, roomId, user, navigate]);

  /* ============================================================
     2. CONNECTION MONITORING
  ============================================================ */
  useEffect(() => {
    const updateConnectionState = () => {
      const state = peer.peer.connectionState;
      setConnectionState(state);
      if (state === "connected") {
        setIsSecureConnection(true);
      } else if (state === "failed" || state === "disconnected") {
        setIsSecureConnection(false);
      }
    };

    const updateIceState = () => {
      setIceConnectionState(peer.peer.iceConnectionState);
    };

    peer.peer.addEventListener("connectionstatechange", updateConnectionState);
    peer.peer.addEventListener("iceconnectionstatechange", updateIceState);

    return () => {
      peer.peer.removeEventListener(
        "connectionstatechange",
        updateConnectionState
      );
      peer.peer.removeEventListener("iceconnectionstatechange", updateIceState);
    };
  }, []);

  /* ============================================================
     3. CALL INITIATION & HANDLING
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

      // Create offer
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Could not access camera/microphone.");
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        setMyStream(stream);
        setCallStarted(true);

        stream.getTracks().forEach((track) => {
          peer.peer.addTrack(track, stream);
        });

        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });

        // Process queued ICE candidates
        await peer.processPendingCandidates();
      } catch (err) {
        console.error("Error accepting call:", err);
      }
    },
    [socket]
  );

  const handleCallAccepted = useCallback(async ({ ans }) => {
    console.log("✅ Call Accepted");
    await peer.setRemoteAnswer(ans);
    await peer.processPendingCandidates();
  }, []);

  /* ============================================================
     4. NEGOTIATION HANDLERS
  ============================================================ */
  const handleNegoNeeded = useCallback(async () => {
    if (negoInProgress.current || peer.peer.signalingState !== "stable") return;

    try {
      negoInProgress.current = true;
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    } catch (error) {
      console.error("Negotiation failed:", error);
    } finally {
      setTimeout(() => (negoInProgress.current = false), 1000);
    }
  }, [remoteSocketId, socket]);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setRemoteAnswer(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  /* ============================================================
     5. ICE CANDIDATES & TRACKS
  ============================================================ */
  useEffect(() => {
    const handleIceCandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("peer:ice", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    const handleTrack = (ev) => {
      console.log("📺 Remote Stream Received");
      const stream = ev.streams[0];
      setRemoteStream(stream);

      // OPTIONAL: Listen for mute/unmute events to update UI if needed
      stream.getVideoTracks()[0].onmute = () => {
        console.log("Remote peer turned off camera");
        // You could set a state here like setIsRemoteCameraOn(false)
      };
      stream.getVideoTracks()[0].onunmute = () => {
        console.log("Remote peer turned on camera");
        // You could set a state here like setIsRemoteCameraOn(true)
      };
    };

    peer.peer.addEventListener("icecandidate", handleIceCandidate);
    peer.peer.addEventListener("track", handleTrack);

    return () => {
      peer.peer.removeEventListener("icecandidate", handleIceCandidate);
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, [remoteSocketId, socket]);

  const handleIncomingIce = useCallback(async ({ candidate }) => {
    if (candidate) {
      await peer.addIceCandidate(candidate);
    }
  }, []);

  /* ============================================================
     6. SOCKET EVENT LISTENERS
  ============================================================ */
  useEffect(() => {
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("peer:ice", handleIncomingIce);

    return () => {
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("peer:ice", handleIncomingIce);
    };
  }, [
    socket,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
    handleIncomingIce,
  ]);

  /* ============================================================
     7. VIDEO REF MANAGEMENT
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
     8. MEDIA CONTROLS
  ============================================================ */
  const toggleMic = useCallback(() => {
    setMicOn((prev) => {
      const newStatus = !prev; // The status we WANT to be in

      // 1. Toggle Local Stream (for your own audio feedback)
      if (myStream) {
        myStream.getAudioTracks().forEach((track) => {
          track.enabled = newStatus;
        });
      }

      // 2. Toggle Peer Connection Sender (CRITICAL FIX)
      // This ensures the track actually being sent to the other user is toggled
      if (peer.peer) {
        const senders = peer.peer.getSenders();
        const audioSender = senders.find(
          (s) => s.track && s.track.kind === "audio"
        );
        if (audioSender && audioSender.track) {
          audioSender.track.enabled = newStatus;
        }
      }

      return newStatus;
    });
  }, [myStream]);

  const toggleCamera = useCallback(() => {
    setCameraOn((prev) => {
      const newStatus = !prev; // The status we WANT to be in

      // 1. Toggle Local Stream (for your self-view)
      if (myStream) {
        myStream.getVideoTracks().forEach((track) => {
          track.enabled = newStatus;
        });
      }

      // 2. Toggle Peer Connection Sender (CRITICAL FIX)
      // This ensures the track actually being sent to the other user is toggled
      if (peer.peer) {
        const senders = peer.peer.getSenders();
        const videoSender = senders.find(
          (s) => s.track && s.track.kind === "video"
        );
        if (videoSender && videoSender.track) {
          videoSender.track.enabled = newStatus;
        }
      }

      return newStatus;
    });
  }, [myStream]);

  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }
    setRemoteStream(null);
    setCallStarted(false);
    setRemoteSocketId(null);
    setIsSecureConnection(false);
    peer.resetConnection();
    navigate(`/${user?.role}`)
  };

  const ConnectionStatus = () => {
    if (!callStarted) return null;
    let color = "bg-gray-500";
    let text = "Initializing...";

    if (isSecureConnection && connectionState === "connected") {
      color = "bg-green-500";
      text = "Secure P2P Connection";
    } else if (
      connectionState === "connecting" ||
      iceConnectionState === "checking"
    ) {
      color = "bg-yellow-500 animate-pulse";
      text = "Establishing Connection...";
    } else if (connectionState === "failed") {
      color = "bg-red-500";
      text = "Connection Failed";
    }

    return (
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 px-3 py-2 rounded-lg text-sm z-20">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-white">{text}</span>
        {isSecureConnection && <Shield className="text-green-400" size={16} />}
      </div>
    );
  };

  /* ============================================================
     9. RENDER UI
  ============================================================ */
  if (!callStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <Shield className="mx-auto mb-4 text-blue-400" size={64} />
          <h1 className="text-3xl font-semibold mb-2">Secure Consultation</h1>
          <p className="text-sm text-slate-400">
            Verifying Identity & Encryption...
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl mb-6 text-center min-w-75">
          <h2 className="text-xl font-bold text-white mb-2">Room: {roomId}</h2>
          <p className="text-slate-400">
            Logged in as: <span className="text-blue-400">{user?.email}</span>
          </p>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          {remoteSocketId
            ? "✅ Participant connected"
            : "⏳ Waiting for participant..."}
        </p>

        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Shield size={20} />
            Start Consultation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col relative">
      <ConnectionStatus />
      <div className="flex-1 grid grid-cols-2 gap-2 p-2">
        {/* Local Video */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          {cameraOn && myStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-800">
              <VideoOff size={48} />
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-sm flex items-center gap-2">
            You{" "}
            {isSecureConnection && (
              <Shield className="text-green-400" size={14} />
            )}
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
              <div className="animate-pulse">Connecting video...</div>
            </div>
          )}
          {remoteStream && (
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-sm">
              Participant
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {chatOpen && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col z-10">
          <div className="p-4 border-b font-semibold flex items-center justify-between">
            <span>Secure Chat</span>
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="flex-1 p-3 text-sm text-gray-600">
            Chat feature would go here...
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="h-20 bg-gray-800 flex items-center justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full ${
            micOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-600"
          }`}
        >
          {micOn ? (
            <Mic className="text-white" />
          ) : (
            <MicOff className="text-white" />
          )}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full ${
            cameraOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-600"
          }`}
        >
          {cameraOn ? (
            <Video className="text-white" />
          ) : (
            <VideoOff className="text-white" />
          )}
        </button>
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-700 hover:bg-red-800"
        >
          <PhoneOff className="text-white" />
        </button>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 rounded-full bg-gray-600 hover:bg-gray-500"
        >
          <MessageSquare className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Room;
