import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, List, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface EnhancedTableOfContentsProps {
  content: string;
  className?: string;
}

export function EnhancedTableOfContents({ content, className }: EnhancedTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const headings = useMemo(() => {
    const matches = content.match(/^#{1,3} .*/gm) || [];
    return matches.map((match, index) => {
      const level = match.match(/^#+/)?.[0].length || 1;
      const text = match.replace(/^#+ /, '');
      const id = `heading-${index}`;
      return { id, text, level };
    });
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-10% 0% -70% 0%',
        threshold: 0
      }
    );

    const elements = document.querySelectorAll('h1, h2, h3');
    elements.forEach((el, index) => {
      if (headings[index]) {
        el.id = headings[index].id;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav 
      className={cn("bg-card border border-border rounded-[2rem] p-6 shadow-sm", className)}
      aria-label="Table of contents"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-bold text-foreground uppercase tracking-wider mb-4"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <List size={16} className="text-primary" aria-hidden="true" />
          On this page
        </span>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className="text-muted-foreground" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-lg text-sm transition-all flex items-center gap-2",
                      heading.level === 1 ? "font-bold" : "",
                      heading.level === 2 ? "pl-6 font-medium" : "",
                      heading.level === 3 ? "pl-10 text-xs" : "",
                      activeId === heading.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    aria-current={activeId === heading.id ? 'true' : undefined}
                  >
                    {activeId === heading.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-4 bg-primary rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="line-clamp-2">{heading.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {headings.length} sections
        </p>
      </div>
    </nav>
  );
}
