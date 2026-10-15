import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

interface UseSearchStateOptions {
  debounceMs?: number;
  syncWithUrl?: boolean;
  urlParam?: string;
  initialValue?: string;
}

interface UseSearchStateReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useSearchState(options: UseSearchStateOptions = {}): UseSearchStateReturn {
  const {
    debounceMs = 300,
    syncWithUrl = false,
    urlParam = 'search',
    initialValue = ''
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => {
    if (syncWithUrl) {
      return searchParams.get(urlParam) || initialValue;
    }
    return initialValue;
  });
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Sync debounced query with URL
  useEffect(() => {
    if (syncWithUrl) {
      if (debouncedQuery) {
        setSearchParams(prev => {
          prev.set(urlParam, debouncedQuery);
          return prev;
        });
      } else {
        setSearchParams(prev => {
          prev.delete(urlParam);
          return prev;
        });
      }
    }
  }, [debouncedQuery, syncWithUrl, urlParam, setSearchParams]);

  const clearQuery = useCallback(() => {
    setQuery('');
    if (syncWithUrl) {
      setSearchParams(prev => {
        prev.delete(urlParam);
        return prev;
      });
    }
  }, [syncWithUrl, setSearchParams, urlParam]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    isFocused,
    setIsFocused,
    inputProps: {
      value: query,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  };
}
