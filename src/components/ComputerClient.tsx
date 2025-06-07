'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStream } from '@/contexts/StreamContext';

const ComputerClient: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    isConnected,
    isStreaming,
    localStream,
    connectionState,
    onlineDevices,
    startStreaming,
    stopStreaming,
    error
  } = useStream();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGhostMode, setIsGhostMode] = useState(false);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Ghost mode keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isGhostMode) {
        setIsGhostMode(false);
      }
    };

    if (isGhostMode) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling when in ghost mode
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isGhostMode]);

  const handleStartStream = async () => {
    try {
      await startStreaming();
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  };

  const toggleGhostMode = () => {
    setIsGhostMode(!isGhostMode);
  };

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    if (connectionState === 'connected') return 'bg-green-500';
    if (connectionState === 'connecting') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getConnectionStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (connectionState === 'connected') return 'Connected';
    if (connectionState === 'connecting') return 'Connecting';
    return 'Waiting';
  };

  const mobileDevices = onlineDevices.filter(device => device.deviceType === 'mobile');
  return (
    <React.Fragment>
      {/* Ghost Mode Overlay - Covers absolutely everything */}
      {isGhostMode && (
        <div className="fixed inset-0 bg-black z-[999999] cursor-none select-none">
          {/* Completely black screen - looks like computer is asleep */}
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Stream Connect - Computer
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {user?.username}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
                  <span className="text-sm font-medium">{getConnectionStatusText()}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Video Preview
                  </h2>
                  
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                    />
                    
                    {!isStreaming && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <p className="text-white text-lg">Camera not active</p>
                      </div>
                    )}

                    {isStreaming && (
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">LIVE</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stream Controls */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream Quality
                      </label>
                      <select
                        value={streamQuality}
                        onChange={(e) => setStreamQuality(e.target.value as 'low' | 'medium' | 'high')}
                        disabled={isStreaming}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low (640x480, 15fps)</option>
                        <option value="medium">Medium (1280x720, 30fps)</option>
                        <option value="high">High (1920x1080, 30fps)</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-3">
                      {!isStreaming ? (
                        <button
                          onClick={handleStartStream}
                          disabled={!isConnected}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Start Stream
                        </button>
                      ) : (
                        <button
                          onClick={stopStreaming}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          Stop Stream
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ghost Mode Button */}
                  <div className="mt-4">
                    <button
                      onClick={toggleGhostMode}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-medium hover:border-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                      title="Enable Ghost Mode - Press ESC to exit"
                    >
                      <span>👻</span>
                      <span>Ghost Mode</span>
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Connected Devices */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Connected Mobile Devices
                  </h3>
                  
                  {mobileDevices.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-2">
                        📱
                      </div>
                      <p className="text-sm text-gray-500">
                        No mobile devices connected
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Login with the same username on your mobile device
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mobileDevices.map((device, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">
                              Mobile Device
                            </span>
                          </div>
                          <span className="text-xs text-green-600">Connected</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stream Status */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Stream Status
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${isStreaming ? 'text-green-600' : 'text-gray-500'}`}>
                        {isStreaming ? 'Streaming' : 'Stopped'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quality:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {streamQuality}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connection:</span>
                      <span className={`text-sm font-medium ${
                        connectionState === 'connected' ? 'text-green-600' : 
                        connectionState === 'connecting' ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {connectionState || 'Not connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-6">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    How to use:
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>1. Ensure your mobile device is connected</li>
                    <li>2. Select your preferred stream quality</li>
                    <li>3. Click "Start Stream" to begin</li>
                    <li>4. Mobile device can control the stream</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>        </div>
      </div>
    </React.Fragment>
  );
};

export default ComputerClient;
