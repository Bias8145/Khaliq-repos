import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProgressToastProps {
  isOpen: boolean;
  message: string;
  duration?: number;
  onClose: () => void;
}

export function ProgressToast({ 
  isOpen, 
  message, 
  duration = 5000, 
  onClose 
}: ProgressToastProps) {
  const [progress, setProgress] = useState(100);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      setIsComplete(false);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(onClose, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-card border border-border rounded-2xl shadow-xl overflow-hidden min-w-[300px] max-w-md"
        >
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
              <span className="text-sm font-medium text-foreground">
                {isComplete ? 'Completed!' : message}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="h-1 bg-secondary">
            <motion.div
              className={cn(
                "h-full transition-colors",
                isComplete ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
