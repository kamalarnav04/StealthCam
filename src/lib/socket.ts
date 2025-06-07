import { io, Socket } from 'socket.io-client';

export interface DeviceInfo {
  socketId: string;
  deviceType: string;
  connected: boolean;
}

export interface DeviceDisconnectedData {
  deviceType: string;
  userId: string;
}

export interface StreamRequestData {
  fromUserId: string;
  fromDeviceType: string;
}

export interface StreamStartedData {
  fromUserId: string;
  streamId: string;
}

export interface StreamStoppedData {
  fromUserId: string;
}

export interface SignalingData {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  fromUserId: string;
  fromDeviceType: string;
}

export interface SocketAuth {
  token: string;
  userId: string;
  deviceType: 'computer' | 'mobile';
}

export class SocketService {
  private socket: Socket | null = null;
  private auth: SocketAuth | null = null;

  connect(auth: SocketAuth): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.auth = auth;
      
      this.socket = io({
        path: '/api/socketio',
        auth: {
          token: auth.token
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Device management
  getOnlineDevices(): void {
    if (this.socket) {
      this.socket.emit('get-online-devices');
    }
  }
  onOnlineDevices(callback: (devices: DeviceInfo[]) => void): void {
    if (this.socket) {
      this.socket.on('online-devices', callback);
    }
  }

  onDeviceConnected(callback: (data: DeviceInfo & { userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('device-connected', callback);
    }
  }

  onDeviceDisconnected(callback: (data: DeviceDisconnectedData) => void): void {
    if (this.socket) {
      this.socket.on('device-disconnected', callback);
    }
  }

  // Stream events
  onStreamStarted(callback: (data: StreamStartedData) => void): void {
    if (this.socket) {
      this.socket.on('stream-started', callback);
    }
  }
  onStreamStopped(callback: (data: StreamStoppedData) => void): void {
    if (this.socket) {
      this.socket.on('stream-stopped', callback);
    }
  }

  onStreamRequested(callback: (data: StreamRequestData) => void): void {
    if (this.socket) {
      this.socket.on('stream-requested', callback);
    }
  }

  cleanup(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
