import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { cn } from '../../lib/utils';

export function NetworkStatus() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-3 px-4 text-center text-sm font-bold flex items-center justify-center gap-2"
        >
          <WifiOff size={16} />
          <span>You are offline. Some features may not be available.</span>
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 p-1.5 rounded-full hover:bg-destructive-foreground/10 transition-colors"
            aria-label="Retry connection"
          >
            <RefreshCw size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NetworkIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium transition-colors",
        isOnline ? "text-emerald-500" : "text-destructive"
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi size={14} aria-hidden="true" />
          <span className="sr-only">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={14} aria-hidden="true" />
          <span className="sr-only">Offline</span>
        </>
      )}
    </div>
  );
}
