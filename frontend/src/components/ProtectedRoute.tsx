import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { subscribeToAuth, waitForAuthInit } from '../services/firebase';
import { Music2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    waitForAuthInit().then((initialUser) => {
      if (isMounted) {
        setUser(initialUser);
        setIsInitializing(false);
      }
    });

    const unsubscribe = subscribeToAuth((updatedUser) => {
      if (isMounted) {
        setUser(updatedUser);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
          <Music2 size={24} className="text-white" />
        </div>
        <p className="text-xs font-semibold tracking-widest text-neutral-400 mt-4 uppercase">
          AURA MUSIC
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
