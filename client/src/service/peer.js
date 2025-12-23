// service/peer.js

class PeerService {
  constructor() {
    this.peer = null;
    this.initializePeer();
  }

  initializePeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        // Google STUN servers
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        
        // Twilio STUN server
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
      // Security and connection configuration
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all", // Use both STUN and TURN if available
      bundlePolicy: "max-bundle", // Bundle all media on single connection
      rtcpMuxPolicy: "require", // Multiplex RTP and RTCP
    });

    // Monitor connection state for security
    this.peer.onconnectionstatechange = () => {
      console.log("Connection state:", this.peer.connectionState);
      
      if (this.peer.connectionState === "failed") {
        console.error("Connection failed - attempting ICE restart");
        this.restartIce();
      }
    };

    // Monitor ICE connection state
    this.peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", this.peer.iceConnectionState);
      
      if (this.peer.iceConnectionState === "disconnected") {
        console.warn("ICE disconnected - connection may be unstable");
      }
      
      if (this.peer.iceConnectionState === "failed") {
        console.error("ICE connection failed");
        this.restartIce();
      }
    };

    // Monitor ICE gathering state
    this.peer.onicegatheringstatechange = () => {
      console.log("ICE gathering state:", this.peer.iceGatheringState);
    };
  }

  async getOffer() {
    try {
      const offer = await this.peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: false,
      });
      await this.peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  async getAnswer(offer) {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  async setRemoteAnswer(answer) {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error setting remote answer:", error);
      throw error;
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (this.peer.remoteDescription) {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE candidate added successfully");
      } else {
        console.warn("Remote description not set, queuing ICE candidate");
        // Queue the candidate if remote description isn't set yet
        if (!this.pendingCandidates) {
          this.pendingCandidates = [];
        }
        this.pendingCandidates.push(candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  async processPendingCandidates() {
    if (this.pendingCandidates && this.pendingCandidates.length > 0) {
      console.log(`Processing ${this.pendingCandidates.length} pending ICE candidates`);
      for (const candidate of this.pendingCandidates) {
        await this.addIceCandidate(candidate);
      }
      this.pendingCandidates = [];
    }
  }

  async restartIce() {
    try {
      console.log("Restarting ICE...");
      const offer = await this.peer.createOffer({ iceRestart: true });
      await this.peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error restarting ICE:", error);
      throw error;
    }
  }

  getConnectionStats() {
    return {
      connectionState: this.peer?.connectionState,
      iceConnectionState: this.peer?.iceConnectionState,
      iceGatheringState: this.peer?.iceGatheringState,
      signalingState: this.peer?.signalingState,
    };
  }

  async getDetailedStats() {
    if (!this.peer) return null;
    
    const stats = await this.peer.getStats();
    const result = {
      candidatePairs: [],
      localCandidates: [],
      remoteCandidates: [],
    };

    stats.forEach((report) => {
      if (report.type === "candidate-pair" && report.state === "succeeded") {
        result.candidatePairs.push({
          local: report.localCandidateId,
          remote: report.remoteCandidateId,
          state: report.state,
          priority: report.priority,
        });
      }
      if (report.type === "local-candidate") {
        result.localCandidates.push({
          id: report.id,
          type: report.candidateType,
          protocol: report.protocol,
          address: report.address,
          port: report.port,
        });
      }
      if (report.type === "remote-candidate") {
        result.remoteCandidates.push({
          id: report.id,
          type: report.candidateType,
          protocol: report.protocol,
          address: report.address,
          port: report.port,
        });
      }
    });

    return result;
  }

  resetConnection() {
    if (this.peer) {
      // Close all transceivers
      if (this.peer.getTransceivers) {
        this.peer.getTransceivers().forEach((transceiver) => {
          if (transceiver.stop) {
            transceiver.stop();
          }
        });
      }

      // Close the connection
      this.peer.close();
      console.log("Peer connection closed");
    }

    // Clear pending candidates
    this.pendingCandidates = [];

    // Reinitialize
    this.initializePeer();
  }
}

export default new PeerService();