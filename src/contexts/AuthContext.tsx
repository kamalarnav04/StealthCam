'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  username: string;
  deviceType: 'computer' | 'mobile';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, deviceType: 'computer' | 'mobile') => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  useEffect(() => {
    // Check for stored authentication (both dev and production)
    const storedUser = sessionStorage.getItem('streamUser') || localStorage.getItem('streamUser');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Migrate to sessionStorage if it was in localStorage
        if (!sessionStorage.getItem('streamUser')) {
          sessionStorage.setItem('streamUser', storedUser);
          localStorage.removeItem('streamUser');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        sessionStorage.removeItem('streamUser');
        localStorage.removeItem('streamUser');
      }
    }
    setIsLoading(false);
  }, []);
  const login = async (username: string, password: string, deviceType: 'computer' | 'mobile') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, deviceType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Login failed with status ${response.status}`);
      }

      const userData = await response.json();
      
      // Validate the response data
      if (!userData.token || !userData.userId || !userData.username) {
        throw new Error('Invalid response from server');
      }

      setUser(userData);
      // Store in sessionStorage for session-based auth
      sessionStorage.setItem('streamUser', JSON.stringify(userData));
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };  const logout = () => {
    setUser(null);
    setError(null);
    sessionStorage.removeItem('streamUser');
    localStorage.removeItem('streamUser');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    clearError,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
