import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bookmark, X, Clock, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Bookmark as BookmarkType } from '../../hooks/useBookmarks';

interface BookmarksListProps {
  bookmarks: BookmarkType[];
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarksList({ 
  bookmarks, 
  onRemove, 
  onClear, 
  isOpen, 
  onClose 
}: BookmarksListProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[95] w-full max-w-md bg-card border-l border-border shadow-xl overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Bookmarks"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bookmark size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Bookmarks</h2>
                  <p className="text-xs text-muted-foreground">
                    {bookmarks.length} saved {bookmarks.length === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close bookmarks"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Bookmark size={28} className="text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No bookmarks yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Save posts to read later by clicking the bookmark icon on any post.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {bookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group"
                      >
                        <Link
                          to={`/post/${bookmark.id}`}
                          onClick={onClose}
                          className="block p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {bookmark.category && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {bookmark.category}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {bookmark.title}
                              </h3>
                              {bookmark.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                  {bookmark.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                                <Clock size={12} aria-hidden="true" />
                                <span>Saved {format(new Date(bookmark.savedAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(bookmark.id);
                              }}
                              className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              aria-label={`Remove ${bookmark.title} from bookmarks`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {bookmarks.length > 0 && (
              <div className="p-4 border-t border-border">
                <button
                  onClick={onClear}
                  className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Clear All Bookmarks
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
