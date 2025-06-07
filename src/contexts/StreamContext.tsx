'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '@/lib/socket';
import { WebRTCService } from '@/lib/webrtc';

export interface StreamContextType {
  isConnected: boolean;
  isStreaming: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  onlineDevices: { socketId: string; deviceType: string; connected: boolean }[];
  startStreaming: () => Promise<void>;
  stopStreaming: () => void;
  requestStream: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export const useStream = () => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};

interface StreamProviderProps {
  children: ReactNode;
}

export const StreamProvider: React.FC<StreamProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [onlineDevices, setOnlineDevices] = useState<{ socketId: string; deviceType: string; connected: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);

  const startStreaming = useCallback(async () => {
    if (!webrtcRef.current || !user) return;

    try {
      setError(null);
      await webrtcRef.current.startStreaming();
      setLocalStream(webrtcRef.current.getLocalStream());
      setIsStreaming(true);
    } catch (error) {
      console.error('Error starting stream:', error);
      setError(error instanceof Error ? error.message : 'Failed to start streaming');
    }
  }, [user]);

  const connect = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const socket = await socketService.connect({
        token: user.token,
        userId: user.userId,
        deviceType: user.deviceType
      });

      setIsConnected(true);

      // Initialize WebRTC service
      webrtcRef.current = new WebRTCService(socket);

      // Set up WebRTC event handlers
      webrtcRef.current.onRemoteStream((stream) => {
        console.log('Remote stream received');
        setRemoteStream(stream);
      });

      webrtcRef.current.onConnectionStateChange((state) => {
        console.log('Connection state changed:', state);
        setConnectionState(state);
        if (state === 'connected') {
          setError(null);
        } else if (state === 'failed' || state === 'disconnected') {
          setError('Connection failed or lost');
        }
      });

      // Set up socket event handlers
      socketService.onOnlineDevices((devices) => {
        setOnlineDevices(devices);
      });

      socketService.onStreamStarted((data) => {
        console.log('Stream started by:', data.fromUserId);
      });

      socketService.onStreamStopped((data) => {
        console.log('Stream stopped by:', data.fromUserId);
        setRemoteStream(null);
        setIsStreaming(false);
      });

      socketService.onStreamRequested((data) => {
        console.log('Stream requested by:', data.fromUserId, data.fromDeviceType);
        // Auto-accept stream requests (can be made optional)
        if (user.deviceType === 'computer') {
          startStreaming();
        }
      });      socketService.onDeviceConnected((data) => {
        console.log('Device connected:', data);
        setOnlineDevices(prev => {
          // Avoid duplicates
          const exists = prev.find(d => d.socketId === data.socketId);
          if (exists) return prev;
          return [...prev, { 
            socketId: data.socketId, 
            deviceType: data.deviceType, 
            connected: true 
          }];
        });
      });

      socketService.onDeviceDisconnected((data) => {
        console.log('Device disconnected:', data);
        setOnlineDevices(prev => prev.filter(d => d.deviceType !== data.deviceType));
      });

      // Get initial list of online devices
      socketService.getOnlineDevices();    } catch (error) {
      console.error('Connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
      setIsConnected(false);
    }
  }, [user, startStreaming]); // Add useCallback dependency
  const disconnect = useCallback(() => {
    if (webrtcRef.current) {
      webrtcRef.current.cleanup();
      webrtcRef.current = null;
    }

    socketService.cleanup();
    socketService.disconnect();

    setIsConnected(false);
    setIsStreaming(false);
    setRemoteStream(null);
    setLocalStream(null);
    setConnectionState(null);
    setOnlineDevices([]);
  }, []); // No dependencies needed for disconnect

  useEffect(() => {
    if (user && !isConnected) {
      connect();
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [user, isConnected, connect, disconnect]);  const stopStreaming = useCallback(() => {
    if (!webrtcRef.current) return;

    webrtcRef.current.stopStreaming();
    setLocalStream(null);
    setIsStreaming(false);
  }, []);

    const requestStream = useCallback(() => {
    if (!user || !webrtcRef.current) return;

    console.log('Requesting stream from connected devices');
    webrtcRef.current.requestStream();
  }, [user]);

  const value: StreamContextType = {
    isConnected,
    isStreaming,
    remoteStream,
    localStream,
    connectionState,
    onlineDevices,
    startStreaming,
    stopStreaming,
    requestStream,
    connect,
    disconnect,
    error,
  };

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};
