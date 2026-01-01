import React from 'react';

export const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  // Improved renderer with clean, simple typography (Inter)
  const htmlContent = content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl md:text-4xl font-bold text-foreground mt-10 mb-6 pb-2 border-b border-border tracking-tight">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4 tracking-tight">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3 tracking-tight">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic text-muted-foreground">$1</em>')
    .replace(/<u>(.*)<\/u>/gim, '<u class="decoration-primary/50 decoration-2 underline-offset-4">$1</u>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc marker:text-primary pl-2 mb-1">$1</li>')
    .replace(/\n/gim, '<br />');

  // Removed "font-serif" to comply with "Simple and easy to read" request
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose-invert leading-relaxed text-foreground/90 text-lg max-w-none font-sans" />;
};
