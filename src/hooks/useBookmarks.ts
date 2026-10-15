import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  title: string;
  excerpt?: string;
  category?: string;
  savedAt: string;
}

const STORAGE_KEY = 'khaliq_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
  }, []);

  const addBookmark = useCallback((post: { id: string; title: string; excerpt?: string; category?: string }) => {
    const newBookmark: Bookmark = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      savedAt: new Date().toISOString()
    };

    setBookmarks(prev => {
      const exists = prev.some(b => b.id === post.id);
      if (exists) return prev;
      const newBookmarks = [newBookmark, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const toggleBookmark = useCallback((post: { id: string; title: string; excerpt?: string; category?: string }) => {
    const isBookmarked = bookmarks.some(b => b.id === post.id);
    if (isBookmarked) {
      removeBookmark(post.id);
    } else {
      addBookmark(post);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    bookmarkCount: bookmarks.length
  };
}
