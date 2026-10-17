import { useMemo } from 'react';

export interface ContentStats {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  sentenceCount: number;
  paragraphCount: number;
}

export function useContentStats(content: string): ContentStats {
  return useMemo(() => {
    if (!content || content.trim() === '') {
      return {
        wordCount: 0,
        characterCount: 0,
        readingTime: 0,
        sentenceCount: 0,
        paragraphCount: 0
      };
    }

    const plainText = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      .replace(/[#*_~>`]/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();

    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    const characterCount = plainText.length;
    
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    const wordsPerMinute = 200;
    const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

    return {
      wordCount,
      characterCount,
      readingTime,
      sentenceCount,
      paragraphCount
    };
  }, [content]);
}
