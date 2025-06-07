'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DevAuthHelperProps {
  children: React.ReactNode;
}

export default function DevAuthHelper({ children }: DevAuthHelperProps) {
  const { logout, user } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const clearAuth = () => {
    sessionStorage.removeItem('streamUser');
    localStorage.removeItem('streamUser');
    logout();
  };

  return (
    <div className="relative">
      {children}
      {isDevelopment && user && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={clearAuth}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs shadow-lg border border-red-600"
            title="Development: Clear Auth"
          >
            🔄 Reset Auth
          </button>
        </div>
      )}
    </div>
  );
}
