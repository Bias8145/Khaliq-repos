import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function BookmarkButton({ 
  isBookmarked: initialBookmarked, 
  onToggle, 
  size = 'md',
  showLabel = false,
  className 
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsBookmarked(prev => !prev);
    
    setTimeout(() => {
      onToggle();
      setIsAnimating(false);
    }, 150);
  }, [onToggle, isAnimating]);

  React.useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isAnimating}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-300 ease-out",
        sizeClasses[size],
        isBookmarked 
          ? "bg-amber-500 text-white shadow-md shadow-amber-500/30" 
          : "bg-secondary text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500",
        showLabel && "px-4 gap-2",
        isAnimating && "pointer-events-none",
        className
      )}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-pressed={isBookmarked}
      role="button"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isBookmarked ? 'bookmarked' : 'not-bookmarked'}
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 45, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {isBookmarked ? (
            <BookmarkCheck 
              size={iconSizes[size]} 
              className="fill-current"
              aria-hidden="true" 
            />
          ) : (
            <Bookmark 
              size={iconSizes[size]} 
              aria-hidden="true" 
            />
          )}
        </motion.div>
      </AnimatePresence>
      {showLabel && (
        <span className="text-sm font-bold transition-all duration-200">
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
}

export function BookmarkIcon({ 
  isBookmarked, 
  onClick,
  size = 18,
  className 
}: { 
  isBookmarked: boolean; 
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}) {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  React.useEffect(() => {
    setLocalBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalBookmarked(prev => !prev);
    onClick(e);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300 ease-out",
        localBookmarked 
          ? "bg-amber-500/20 text-amber-500" 
          : "bg-transparent text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10",
        className
      )}
      aria-label={localBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-pressed={localBookmarked}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={localBookmarked ? 'filled' : 'outline'}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ duration: 0.15 }}
        >
          <Bookmark 
            size={size} 
            className={cn(
              "transition-colors duration-200",
              localBookmarked && "fill-amber-500 text-amber-500"
            )}
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
