// Type definitions for search functionality

export interface SearchablePost {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
}

export interface SearchableDocument {
  id: string;
  title: string;
  content?: string;
  category?: string;
}

export interface SearchState {
  query: string;
  isFocused: boolean;
  isOpen: boolean;
}

export interface SearchActions {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  focus: () => void;
  blur: () => void;
  open: () => void;
  close: () => void;
}
