
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
  X,
  Send,
  User,
  Home,
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
  const hasJoined = useRef(false);
  const chatEndRef = useRef(null);
  const streamRef = useRef(null);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteUserEmail, setRemoteUserEmail] = useState("");
  const [remoteUserName, setRemoteUserName] = useState("");
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [isSecureConnection, setIsSecureConnection] = useState(false);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const isDoctor = user?.role === "doctor";

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomGradient = (email) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-yellow-500 to-orange-600",
    ];
    const index = email ? email.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ============================================================
     1. AUTOMATIC JOIN & AUTHENTICATION
  ============================================================ */
  useEffect(() => {
    if (!socket || !user || hasJoined.current) return;

    hasJoined.current = true;

    console.log("🔒 Attempting to join secure room:", roomId);
    socket.emit("room:join", {
      email: user.email,
      room: roomId,
      userId: user._id,
      name: user.name || user.email.split("@")[0],
      role: user.role,
    });

    const handleRoomJoined = ({ remoteSocketId, remoteUser }) => {
      console.log("✅ Joined Room. Remote Peer ID:", remoteSocketId);
      if (remoteSocketId) {
        setRemoteSocketId(remoteSocketId);
        if (remoteUser) {
          setRemoteUserEmail(remoteUser.email);
          setRemoteUserName(remoteUser.name || remoteUser.email.split("@")[0]);
        }
      }
    };

    const handleUserJoined = ({ email, id, name }) => {
      console.log(`👤 User joined: ${email} (${id})`);
      setRemoteSocketId(id);
      setRemoteUserEmail(email);
      setRemoteUserName(name || email.split("@")[0]);
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
      peer.peer.removeEventListener("connectionstatechange", updateConnectionState);
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

      streamRef.current = stream;
      setMyStream(stream);
      setCallStarted(true);

      stream.getAudioTracks().forEach((track) => (track.enabled = micOn));
      stream.getVideoTracks().forEach((track) => (track.enabled = cameraOn));

      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Could not access camera/microphone.");
    }
  }, [remoteSocketId, socket, micOn, cameraOn]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        streamRef.current = stream;
        setMyStream(stream);
        setCallStarted(true);

        stream.getAudioTracks().forEach((track) => (track.enabled = micOn));
        stream.getVideoTracks().forEach((track) => (track.enabled = cameraOn));

        stream.getTracks().forEach((track) => {
          peer.peer.addTrack(track, stream);
        });

        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });

        await peer.processPendingCandidates();
      } catch (err) {
        console.error("Error accepting call:", err);
      }
    },
    [socket, micOn, cameraOn]
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
    if (!remoteSocketId || !myStream) return;

    try {
      negoInProgress.current = true;
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    } catch (error) {
      console.error("Negotiation failed:", error);
    } finally {
      setTimeout(() => (negoInProgress.current = false), 1000);
    }
  }, [remoteSocketId, socket, myStream]);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      if (from !== remoteSocketId) return;
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket, remoteSocketId]
  );

  const handleNegoFinal = useCallback(
    async ({ from, ans }) => {
      if (from !== remoteSocketId) return;
      await peer.setRemoteAnswer(ans);
    },
    [remoteSocketId]
  );

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
     6. MEDIA CONTROLS WITH STREAM RESTART
  ============================================================ */
  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;

    const newState = !micOn;
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = newState;
    });

    if (peer.peer) {
      const senders = peer.peer.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === "audio");
      if (audioSender?.track) {
        audioSender.track.enabled = newState;
      }
    }

    setMicOn(newState);

    if (remoteSocketId) {
      socket.emit("media:toggle", {
        room: roomId,
        type: "audio",
        enabled: newState,
      });
    }
  }, [micOn, remoteSocketId, socket, roomId]);

  const toggleCamera = useCallback(async () => {
    if (!streamRef.current) return;

    const newState = !cameraOn;

    if (newState) {
      try {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState === "ended") {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          if (peer.peer) {
            const senders = peer.peer.getSenders();
            const videoSender = senders.find((s) => s.track?.kind === "video");
            const audioSender = senders.find((s) => s.track?.kind === "audio");

            if (videoSender) {
              await videoSender.replaceTrack(newStream.getVideoTracks()[0]);
            }
            if (audioSender) {
              await audioSender.replaceTrack(newStream.getAudioTracks()[0]);
            }
          }

          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = newStream;
          setMyStream(newStream);

          newStream.getAudioTracks().forEach((track) => (track.enabled = micOn));

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
          }
        } else {
          videoTrack.enabled = true;
        }
      } catch (err) {
        console.error("Error restarting camera:", err);
        return;
      }
    } else {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });

      if (peer.peer) {
        const senders = peer.peer.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender?.track) {
          videoSender.track.enabled = false;
        }
      }
    }

    setCameraOn(newState);

    if (remoteSocketId) {
      socket.emit("media:toggle", {
        room: roomId,
        type: "video",
        enabled: newState,
      });
    }
  }, [cameraOn, micOn, remoteSocketId, socket, roomId]);

  /* ============================================================
     7. REMOTE MEDIA STATE
  ============================================================ */
  const handleParticipantMediaUpdate = useCallback(
    ({ userId, type, enabled }) => {
      if (userId === remoteSocketId) {
        if (type === "audio") {
          setRemoteMicOn(enabled);
        } else if (type === "video") {
          setRemoteCameraOn(enabled);
        }
      }
    },
    [remoteSocketId]
  );

  /* ============================================================
     8. CHAT FUNCTIONALITY
  ============================================================ */
  const sendMessage = (e) => {
    e?.preventDefault();
    if (messageInput.trim()) {
      const newMessage = {
        senderId: "me",
        senderName: user.name || user.email.split("@")[0],
        message: messageInput,
        timestamp: Date.now(),
      };

      socket.emit("chat:message", {
        room: roomId,
        message: messageInput,
        senderName: user.name || user.email.split("@")[0],
        timestamp: newMessage.timestamp,
      });

      setMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
    }
  };

  const handleChatMessage = useCallback(
    ({ senderId, senderName, message, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { senderId, senderName, message, timestamp },
      ]);
    },
    []
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============================================================
     9. END CALL / LEAVE
  ============================================================ */
  const endCall = () => {
    if (isDoctor) {
      socket.emit("doctor:end:all", { room: roomId });
    } else {
      socket.emit("user:leave", { room: roomId, userId: socket.id });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setCallEnded(true);
    setCallStarted(false);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setIsSecureConnection(false);
    peer.resetConnection();
  };

  const handleCallEndedByDoctor = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setCallEnded(true);
    setCallStarted(false);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setIsSecureConnection(false);
    peer.resetConnection();

    alert("The doctor has ended the consultation");
  }, []);

  const handleUserLeft = useCallback(
    ({ id }) => {
      if (id === remoteSocketId) {
        setRemoteStream(null);
        setRemoteSocketId(null);
        alert("The other participant has left the call");
      }
    },
    [remoteSocketId]
  );

  const rejoinCall = () => {
    setCallEnded(false);
    setCallStarted(false);
    setRemoteSocketId(null);
    setRemoteStream(null);
    setMessages([]);
    setMyStream(null);
    setCameraOn(true);
    setMicOn(true);
    peer.resetConnection();

    hasJoined.current = false;
    socket.emit("room:join", {
      email: user.email,
      room: roomId,
      userId: user._id,
      name: user.name || user.email.split("@")[0],
      role: user.role,
    });
  };

  const returnToDashboard = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (isDoctor) {
      navigate("/doctor");
    } else {
      navigate("/patient");
    }
  };

  /* ============================================================
     10. SOCKET EVENT LISTENERS
  ============================================================ */
  useEffect(() => {
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("peer:ice", handleIncomingIce);
    socket.on("chat:message", handleChatMessage);
    socket.on("participant:media:update", handleParticipantMediaUpdate);
    socket.on("call:ended:by:doctor", handleCallEndedByDoctor);
    socket.on("user:left", handleUserLeft);

    return () => {
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("peer:ice", handleIncomingIce);
      socket.off("chat:message", handleChatMessage);
      socket.off("participant:media:update", handleParticipantMediaUpdate);
      socket.off("call:ended:by:doctor", handleCallEndedByDoctor);
      socket.off("user:left", handleUserLeft);
    };
  }, [
    socket,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoFinal,
    handleIncomingIce,
    handleChatMessage,
    handleParticipantMediaUpdate,
    handleCallEndedByDoctor,
    handleUserLeft,
  ]);

  /* ============================================================
     11. VIDEO REF MANAGEMENT
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
     12. CONNECTION STATUS COMPONENT
  ============================================================ */
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
     13. RENDER - CALL ENDED
  ============================================================ */
  if (callEnded) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="text-center max-w-md">
          <PhoneOff className="mx-auto mb-4 text-red-400" size={64} />
          <h1 className="text-2xl font-semibold mb-3">Consultation Ended</h1>
          <p className="text-slate-400 mb-8">
            {isDoctor
              ? "You have ended the consultation"
              : "The consultation has ended"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={rejoinCall}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <Video size={18} />
              Rejoin Consultation
            </button>
            <button
              onClick={returnToDashboard}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium flex items-center gap-2"
            >
              <Home size={18} />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     14. RENDER - WAITING LOBBY
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

        <div className="bg-slate-800 p-6 rounded-xl mb-6 text-center min-w-96">
          <h2 className="text-xl font-bold text-white mb-2">Room: {roomId}</h2>
          <p className="text-slate-400">
            Logged in as:{" "}
            <span className="text-blue-400">
              {user?.name || user?.email?.split("@")[0]}
            </span>
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Role: {isDoctor ? "Doctor" : "Patient"}
          </p>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          {remoteSocketId
            ? `✅ ${remoteUserName || "Participant"} connected`
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

  /* ============================================================
     15. RENDER - ACTIVE CALL
  ============================================================ */
  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col relative overflow-hidden">
      <ConnectionStatus />

      <div
        className={`flex-1 grid ${
          chatOpen ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2"
        } gap-2 p-2 ${chatOpen ? "lg:mr-80" : ""}`}
      >
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden">
          {cameraOn && myStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div
              className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${getRandomGradient(
                user?.email
              )}`}
            >
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                  {getInitials(user?.name || user?.email)}
                </div>
                <p className="text-white text-xl font-medium">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-white/70 mt-2">Camera Off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
            <span className="text-white">
              You ({user?.name || user?.email?.split("@")[0]})
            </span>
            {!micOn && <MicOff className="text-red-400" size={14} />}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden">
          {remoteStream && remoteCameraOn ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : remoteStream ? (
            <div
              className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${getRandomGradient(
                remoteUserEmail
              )}`}
            >
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                  {getInitials(remoteUserName)}
                </div>
                <p className="text-white text-xl font-medium">
                  {remoteUserName}
                </p>
                <p className="text-white/70 mt-2">Camera Off</p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full bg-gray-800 flex items-center justify-center text-white">
              <div className="text-center">
                <User className="mx-auto mb-3 text-gray-600" size={64} />
                <span className="text-lg">Waiting for participant...</span>
              </div>
            </div>
          )}
          {remoteStream && (
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
              <span className="text-white">{remoteUserName}</span>
              {!remoteMicOn && <MicOff className="text-red-400" size={14} />}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="absolute right-0 top-0 h-full w-full lg:w-80 bg-white shadow-2xl flex flex-col z-30">
          <div className="p-4 border-b font-semibold flex items-center justify-between bg-blue-600 text-white">
            <span className="flex items-center gap-2">
              <MessageSquare size={20} />
              Chat
            </span>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <MessageSquare
                  className="mx-auto mb-2 text-gray-300"
                  size={48}
                />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.senderId === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.senderId === "me"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.senderName}
                      </p>
                      <p className="text-sm break-word">{msg.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 px-4 border-t border-gray-700">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all transform hover:scale-110 ${
            micOn
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? (
            <Mic className="text-white" size={24} />
          ) : (
            <MicOff className="text-white" size={24} />
          )}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all transform hover:scale-110 ${
            cameraOn
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? (
            <Video className="text-white" size={24} />
          ) : (
            <VideoOff className="text-white" size={24} />
          )}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-700 hover:bg-red-800 transition-all transform hover:scale-110"
          title={isDoctor ? "End consultation for all" : "Leave consultation"}
        >
          <PhoneOff className="text-white" size={24} />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-4 rounded-full transition-all transform hover:scale-110 ${
            chatOpen
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-gray-500"
          } relative`}
          title="Toggle chat"
        >
          <MessageSquare className="text-white" size={24} />
          {messages.length > 0 && !chatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Room;