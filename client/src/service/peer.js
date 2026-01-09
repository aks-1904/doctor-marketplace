// service/peer.js

class PeerService {
  constructor() {
    this.peer = null;
    this.isNegotiating = false;
    this.makingOffer = false;
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
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
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

    // Reset negotiation flags on stable state
    this.peer.onsignalingstatechange = () => {
      if (this.peer.signalingState === "stable") {
        this.isNegotiating = false;
        this.makingOffer = false;
      }
    };
  }

  async getOffer() {
    try {
      // Prevent making multiple offers simultaneously
      if (this.makingOffer) {
        console.log("Already making an offer, skipping...");
        return null;
      }

      this.makingOffer = true;
      
      const offer = await this.peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peer.setLocalDescription(offer);
      this.makingOffer = false;
      
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      this.makingOffer = false;
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
      if (this.peer.signalingState === "have-local-offer") {
        await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
      } else {
        console.warn("Not in correct state to set remote answer:", this.peer.signalingState);
      }
    } catch (error) {
      console.error("Error setting remote answer:", error);
      throw error;
    }
  }

  async addIceCandidate(candidate) {
    try {
      if (this.peer.remoteDescription) {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added");
      } else {
        // This is normal - ICE candidates can arrive before remote description
        console.log("⏳ Queuing ICE candidate (remote description pending)");
        if (!this.pendingCandidates) {
          this.pendingCandidates = [];
        }
        this.pendingCandidates.push(candidate);
      }
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  }

  async processPendingCandidates() {
    if (this.pendingCandidates && this.pendingCandidates.length > 0) {
      console.log(`✅ Processing ${this.pendingCandidates.length} queued ICE candidate(s)`);
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
    this.isNegotiating = false;
    this.makingOffer = false;

    // Reinitialize
    this.initializePeer();
  }
}

export default new PeerService();