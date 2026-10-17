import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onSearch?: () => void;
  onEscape?: () => void;
  onSave?: () => void;
  onNewPost?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    if (cmdKey && e.key === 'k') {
      e.preventDefault();
      config.onSearch?.();
    }

    if (e.key === 'Escape') {
      config.onEscape?.();
    }

    if (cmdKey && e.key === 's') {
      e.preventDefault();
      config.onSave?.();
    }

    if (cmdKey && e.key === 'n') {
      e.preventDefault();
      config.onNewPost?.();
    }
  }, [config]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
