'use client';

import { useEffect } from 'react';

interface ClientBodyProps {
  className: string;
}

export default function ClientBody({ className }: ClientBodyProps) {
  useEffect(() => {
    // Apply body className on the client side only
    if (typeof document !== 'undefined') {
      document.body.className = className;
    }
  }, [className]);

  return null;
}
