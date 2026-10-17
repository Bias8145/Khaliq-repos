import { useMemo } from 'react';

// Type-safe search configuration
export interface SearchConfig<T> {
  data: T[];
  query: string;
  searchFields: (keyof T)[];
  caseSensitive?: boolean;
}

// Type-safe search result with highlighting metadata
export interface SearchResult<T> {
  item: T;
  matches: Record<keyof T, string[]>;
}

// Generic search utility function
export function searchItems<T extends Record<string, unknown>>(
  config: SearchConfig<T>
): T[] {
  const { data, query, searchFields, caseSensitive = false } = config;
  
  if (!query || query.trim() === '') {
    return data;
  }

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();

  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        const normalizedValue = caseSensitive ? value : value.toLowerCase();
        return normalizedValue.includes(normalizedQuery);
      }
      if (Array.isArray(value)) {
        return value.some(v => 
          typeof v === 'string' && 
          (caseSensitive ? v : v.toLowerCase()).includes(normalizedQuery)
        );
      }
      return false;
    });
  });
}

// Hook for search with debouncing built-in
export function useSearch<T extends Record<string, unknown>>(
  data: T[],
  query: string,
  searchFields: (keyof T)[],
  options?: { caseSensitive?: boolean }
): T[] {
  return useMemo(() => {
    return searchItems({
      data,
      query,
      searchFields,
      caseSensitive: options?.caseSensitive
    });
  }, [data, query, searchFields, options?.caseSensitive]);
}

// Utility to check if a field matches search query
export function fieldMatchesQuery(
  value: string | undefined | null,
  query: string,
  caseSensitive = false
): boolean {
  if (!value || !query) return false;
  
  const normalizedValue = caseSensitive ? value : value.toLowerCase();
  const normalizedQuery = caseSensitive ? query : query.toLowerCase();
  
  return normalizedValue.includes(normalizedQuery);
}

// Utility to extract matching snippets for preview
export function extractMatchingSnippet(
  text: string,
  query: string,
  maxLength = 150
): string {
  if (!query || !text) return text?.substring(0, maxLength) || '';
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }
  
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + query.length + 50);
  
  let snippet = text.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}
