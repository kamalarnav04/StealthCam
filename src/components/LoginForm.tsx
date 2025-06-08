'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deviceType, setDeviceType] = useState<'computer' | 'mobile'>('computer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    // Clear any existing errors
    clearError();
    
    setIsSubmitting(true);
    try {
      await login(username, password, deviceType);
    } catch (err) {
      // Error is handled by the context, but log it for debugging
      console.error('Login submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    setDeviceType(isMobile ? 'mobile' : 'computer');
  };
  React.useEffect(() => {
    detectDeviceType();
  }, []);

  // Clear errors when user starts typing
  React.useEffect(() => {
    if (error && (username || password)) {
      clearError();
    }
  }, [username, password, error, clearError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            StealthCam 🕵️‍♂️
          </h1>
          <p className="text-gray-600">
            Remote surveillance monitoring tool
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="computer"
                  checked={deviceType === 'computer'}
                  onChange={(e) => setDeviceType(e.target.value as 'computer' | 'mobile')}
                  className="mr-2"
                />
                <span className="text-sm">Computer (Streamer)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="mobile"
                  checked={deviceType === 'mobile'}
                  onChange={(e) => setDeviceType(e.target.value as 'computer' | 'mobile')}
                  className="mr-2"
                />
                <span className="text-sm">Mobile (Viewer)</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Connecting...' : 'Connect'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            New users will be automatically registered
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Computer:</strong> Captures and streams video/audio</li>
            <li>• <strong>Mobile:</strong> Views the stream and controls it</li>
            <li>• Use the same username on both devices</li>
            <li>• Streams are encrypted and secure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
