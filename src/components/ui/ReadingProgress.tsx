import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ReadingProgressProps {
  progress: number;
  className?: string;
}

export function ReadingProgress({ progress, className }: ReadingProgressProps) {
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-1 bg-secondary/50",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/70"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
    </div>
  );
}

export function ReadingProgressIndicator({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="fixed bottom-28 right-6 z-40 pointer-events-none"
      role="status"
      aria-label={`${Math.round(progress)}% read`}
    >
      <svg 
        className="w-12 h-12 -rotate-90 transform" 
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-secondary/30"
        />
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
