'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStream } from '@/contexts/StreamContext';

const MobileClient: React.FC = () => {
  const { user, logout } = useAuth();  const {
    isConnected,
    remoteStream,
    connectionState,
    onlineDevices,
    requestStream,
    error
  } = useStream();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [remoteStream, volume, isMuted]);

  const toggleFullscreen = async () => {
    if (!remoteVideoRef.current) return;

    try {
      if (!isFullscreen) {
        await remoteVideoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = !isMuted ? 0 : volume;
    }
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

  const computerDevices = onlineDevices.filter(device => device.deviceType === 'computer');
  const hasRemoteStream = remoteStream !== null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div>              <h1 className="text-lg font-semibold text-white">
                StealthCam 📱
              </h1>
              <p className="text-xs text-gray-300">
                {user?.username} (Mobile)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}></div>
                <span className="text-xs font-medium text-gray-300">{getConnectionStatusText()}</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative">
        {/* Video Player */}
        <div className="relative bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-screen object-contain"
            onClick={toggleFullscreen}
          />
          
          {!hasRemoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="text-center px-6">
                <div className="text-6xl mb-4">📺</div>
                <h2 className="text-xl font-medium text-white mb-2">
                  No Stream Available
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  {computerDevices.length === 0 
                    ? "No computer devices connected" 
                    : "Request a stream from your computer"
                  }
                </p>
                
                {computerDevices.length > 0 && (
                  <button
                    onClick={requestStream}
                    disabled={!isConnected}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Request Stream
                  </button>
                )}
              </div>
            </div>
          )}

          {hasRemoteStream && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">LIVE</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        {hasRemoteStream && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="p-4 space-y-4">
              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  className="p-2 bg-gray-800 bg-opacity-75 text-white rounded-full hover:bg-opacity-100 transition-all"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.906 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.906l3.477-3.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.906 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.906l3.477-3.793a1 1 0 011.617.793zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM15 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-800 bg-opacity-75 text-white rounded-full hover:bg-opacity-100 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {computerDevices.length === 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="bg-yellow-600 bg-opacity-90 text-white p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4">⚠️</div>
              <div>
                <p className="text-sm font-medium">No computer devices found</p>
                <p className="text-xs opacity-90">
                  Make sure to login with the same username on your computer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="bg-red-600 bg-opacity-90 text-white p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MobileClient;
