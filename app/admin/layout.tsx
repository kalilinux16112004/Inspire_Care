'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const originalTheme = useRef<string | null>(null);

  useEffect(() => {
    // When we enter the admin panel, we set the theme to light.
    // Save the current theme in a ref to restore it when leaving.
    if (theme && theme !== 'light' && !originalTheme.current) {
      originalTheme.current = theme;
    }
    
    setTheme('light');
    setMounted(true);

    return () => {
      // Restore theme when layout is unmounted
      if (originalTheme.current) {
        setTheme(originalTheme.current);
      }
    };
  }, [theme, setTheme]);

  // Prevent rendering children during SSR / first mount to avoid dark-theme mismatches or flashes.
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-semibold">Loading Admin Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="light bg-slate-50 text-slate-900 min-h-screen">
      {children}
    </div>
  );
}
