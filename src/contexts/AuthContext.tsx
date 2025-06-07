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
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In development mode, always start fresh to ensure login screen appears
    if (isDevelopment) {
      // Clear any existing auth data on development startup
      sessionStorage.removeItem('streamUser');
      localStorage.removeItem('streamUser');
      setIsLoading(false);
      return;
    }
    
    // In production, check for stored authentication
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
      });      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      // Store in sessionStorage instead of localStorage for session-based auth
      sessionStorage.setItem('streamUser', JSON.stringify(userData));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('streamUser');
    localStorage.removeItem('streamUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
