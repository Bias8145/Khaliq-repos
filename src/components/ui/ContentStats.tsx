import React from 'react';
import { Clock, FileText, Type, AlignLeft, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ContentStats as ContentStatsType } from '../../hooks/useContentStats';

interface ContentStatsProps {
  stats: ContentStatsType;
  className?: string;
  compact?: boolean;
}

export function ContentStats({ stats, className, compact = false }: ContentStatsProps) {
  if (compact) {
    return (
      <div 
        className={cn("flex items-center gap-4 text-xs text-muted-foreground", className)}
        role="contentinfo"
        aria-label="Content statistics"
      >
        <span className="flex items-center gap-1.5">
          <Clock size={14} aria-hidden="true" />
          <span>{stats.readingTime} min read</span>
        </span>
        <span className="flex items-center gap-1.5">
          <FileText size={14} aria-hidden="true" />
          <span>{stats.wordCount.toLocaleString()} words</span>
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn("grid grid-cols-2 md:grid-cols-3 gap-3", className)}
      role="contentinfo"
      aria-label="Content statistics"
    >
      <StatCard
        icon={<Clock size={16} />}
        label="Read Time"
        value={`${stats.readingTime} min`}
      />
      <StatCard
        icon={<FileText size={16} />}
        label="Words"
        value={stats.wordCount.toLocaleString()}
      />
      <StatCard
        icon={<Type size={16} />}
        label="Characters"
        value={stats.characterCount.toLocaleString()}
      />
      <StatCard
        icon={<AlignLeft size={16} />}
        label="Sentences"
        value={stats.sentenceCount.toLocaleString()}
      />
      <StatCard
        icon={<Hash size={16} />}
        label="Paragraphs"
        value={stats.paragraphCount.toLocaleString()}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3 border border-border/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}
