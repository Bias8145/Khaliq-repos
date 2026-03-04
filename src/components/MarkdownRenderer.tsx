import React, { useEffect } from 'react';

export const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  let processed = content;
  
  const codeBlocks: string[] = [];
  processed = processed.replace(/```([\s\S]*?)```/g, (match, p1) => {
      codeBlocks.push(p1);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Material 3 Expressive Styling
  processed = processed
    // Gambar (Rounded ekstrem & Shadow)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-[2.5rem] w-full object-cover my-12 shadow-2xl border border-border/50" />')
    // Tautan (Links)
    .replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-primary hover:bg-primary/10 px-2 py-0.5 rounded-full transition-colors decoration-2 underline-offset-4 font-bold underline">$1</a>')
    // Kode Inline (Pill shaped)
    .replace(/`([^`]+)`/g, '<code class="bg-secondary text-primary px-3 py-1 rounded-full text-sm font-mono font-bold">$1</code>')
    // Headings (Tipografi besar & elegan)
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl md:text-5xl font-bold text-foreground mt-16 mb-8 tracking-tight">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl md:text-4xl font-bold text-foreground mt-14 mb-6 tracking-tight">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl md:text-3xl font-semibold text-foreground mt-10 mb-5 tracking-tight">$1</h3>')
    // Formatting Teks
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-muted-foreground">$1</em>')
    .replace(/<u>(.*?)<\/u>/gim, '<u class="decoration-primary/50 decoration-2 underline-offset-4">$1</u>')
    // Lists (Daftar)
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc marker:text-primary pl-2 mb-3 text-justify">$1</li>')
    // Blockquotes (Kutipan dengan gradasi dan rounded ekstrem)
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-6 pr-4 italic text-muted-foreground my-10 py-6 bg-secondary/50 rounded-r-[2rem] text-lg leading-relaxed">$1</blockquote>')
    // Baris Baru (Newlines)
    .replace(/\n/gim, '<br />');

  // Kembalikan Blok Kode dengan gaya Material 3 (Rounded ekstrem)
  codeBlocks.forEach((block, i) => {
      const escapedBlock = block.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      processed = processed.replace(
          `__CODE_BLOCK_${i}__`, 
          `<div class="relative group my-10"><pre class="bg-secondary/80 p-6 md:p-8 rounded-[2.5rem] overflow-x-auto border border-border shadow-inner"><code class="font-mono text-sm md:text-base text-foreground/90 leading-relaxed">${escapedBlock}</code></pre></div>`
      );
  });

  // Effect to attach copy buttons to code blocks after render
  useEffect(() => {
      const preBlocks = document.querySelectorAll('pre');
      preBlocks.forEach((block) => {
          // Prevent adding multiple buttons if component re-renders
          if (block.parentElement?.querySelector('.copy-btn')) return;

          const btn = document.createElement('button');
          btn.className = 'copy-btn absolute top-4 right-4 px-4 py-2 rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all text-xs font-bold opacity-0 group-hover:opacity-100 shadow-sm flex items-center gap-2';
          
          // Copy Icon SVG
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
          
          btn.onclick = () => {
              const code = block.querySelector('code')?.innerText;
              if (code) {
                  navigator.clipboard.writeText(code);
                  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="text-emerald-500">Copied!</span>`;
                  btn.classList.add('border-emerald-500/50', 'bg-emerald-500/10');
                  
                  setTimeout(() => {
                      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
                      btn.classList.remove('border-emerald-500/50', 'bg-emerald-500/10');
                  }, 2000);
              }
          };

          if (block.parentElement) {
              block.parentElement.appendChild(btn);
          }
      });
  }, [content]);

  return (
      <div 
        dangerouslySetInnerHTML={{ __html: processed }} 
        className="prose-invert leading-relaxed text-foreground/90 text-lg md:text-xl max-w-none font-sans text-justify" 
      />
  );
};
