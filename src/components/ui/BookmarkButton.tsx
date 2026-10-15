import React from 'react';
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
  isBookmarked, 
  onToggle, 
  size = 'md',
  showLabel = false,
  className 
}: BookmarkButtonProps) {
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

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        isBookmarked 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary",
        showLabel && "px-4 gap-2",
        className
      )}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      aria-pressed={isBookmarked}
    >
      <AnimatePresence mode="wait">
        {isBookmarked ? (
          <motion.div
            key="bookmarked"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <BookmarkCheck size={iconSizes[size]} aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="not-bookmarked"
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
          >
            <Bookmark size={iconSizes[size]} aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
      {showLabel && (
        <span className="text-sm font-bold">
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
}
