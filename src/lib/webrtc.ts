import { Socket } from 'socket.io-client';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: Socket;
  private isOfferer: boolean = false;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;

  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {    this.socket.on('offer', async (data) => {
      console.log('Received offer from:', data.fromUserId);
      await this.handleOffer(data.offer);
    });

    this.socket.on('answer', async (data) => {
      console.log('Received answer from:', data.fromUserId);
      await this.handleAnswer(data.answer);
    });

    this.socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate from:', data.fromUserId);
      await this.handleIceCandidate(data.candidate);
    });

    this.socket.on('stream-requested', async (data) => {
      console.log('Stream requested by:', data.fromUserId);
      // Auto-start stream when requested (for computer clients)
      if (data.fromDeviceType === 'mobile') {
        await this.startStreaming();
      }
    });
  }

  async initializePeerConnection(): Promise<RTCPeerConnection> {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(this.config);    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        this.socket.emit('ice-candidate', {
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.onConnectionStateChangeCallback && this.peerConnection) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
      }
    };

    return this.peerConnection;
  }
  async startStreaming(constraints?: MediaStreamConstraints): Promise<void> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      await this.initializePeerConnection();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });      // Create and send offer
      this.isOfferer = true;
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      console.log('Sending offer to room');
      this.socket.emit('offer', {
        offer
      });

      console.log('Streaming started and offer sent');
    } catch (error) {
      console.error('Error starting stream:', error);
      throw error;
    }
  }

  async requestStream(): Promise<void> {
    console.log('Requesting stream from room');
    this.socket.emit('request-stream', {});
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.initializePeerConnection();

      await this.peerConnection!.setRemoteDescription(offer);

      // Create and send answer
      const answer = await this.peerConnection!.createAnswer();      await this.peerConnection!.setLocalDescription(answer);

      console.log('Sending answer to room');
      this.socket.emit('answer', {
        answer
      });

      console.log('Answer sent');
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(answer);
        console.log('Answer handled successfully');
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  stopStreaming(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }    this.socket.emit('stop-stream', {});

    console.log('Streaming stopped');
  }

  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  cleanup(): void {
    this.stopStreaming();
    this.socket.off('offer');
    this.socket.off('answer');
    this.socket.off('ice-candidate');
    this.socket.off('stream-requested');
  }
}
