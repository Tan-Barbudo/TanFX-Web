import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-3 left-3 z-50 pointer-events-none select-none"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur animate-bounce">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Modo Offline — TAN FX funciona 100% sin Internet.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Conexión restablecida.</span>
        </div>
      )}
    </div>
  );
};
