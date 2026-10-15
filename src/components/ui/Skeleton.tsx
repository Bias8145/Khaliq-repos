import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-secondary rounded-lg",
        className
      )} 
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 animate-pulse">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-3 rounded-lg" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function PostGridSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 h-full animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-4 rounded-lg" />
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex gap-3 pt-6 border-t border-border">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-pulse">
      <Skeleton className="h-4 w-32 mb-6 rounded" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-secondary p-5 rounded-[1.5rem] border border-border">
            <Skeleton className="h-8 w-12 mb-2 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RepositorySkeleton() {
  return (
    <div className="min-h-screen pt-32 px-5 md:px-8 max-w-7xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-pulse">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-4 w-80 rounded" />
            </div>
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
          
          <div className="bg-card/80 border border-border rounded-[2rem] p-2 animate-pulse">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-10 w-20 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <ProfileCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function PostViewSkeleton() {
  return (
    <div className="min-h-screen pt-28 px-5 md:px-8 max-w-6xl mx-auto pb-48 md:pb-40">
      <Skeleton className="h-8 w-40 mb-8 rounded-full" />
      
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <article className="lg:col-span-8 animate-pulse">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          <Skeleton className="h-12 w-full mb-6 rounded-lg" />
          
          <div className="flex flex-wrap items-center gap-3 mb-12 pb-8 border-b border-border">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-4 w-full rounded" />
            ))}
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </article>
        
        <aside className="lg:col-span-4 space-y-8 animate-pulse">
          <div className="bg-card border border-border rounded-[2rem] p-6">
            <Skeleton className="h-4 w-32 mb-4 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 px-5 md:px-8 max-w-6xl mx-auto animate-pulse">
      <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 mb-20 md:mb-28">
        <Skeleton className="h-6 w-48 mb-8 rounded-full" />
        <Skeleton className="h-16 w-3/4 mb-8 rounded-lg" />
        <Skeleton className="h-6 w-2/3 mb-10 rounded" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 md:p-8 rounded-[2.5rem] bg-card border border-border">
            <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
            <Skeleton className="h-6 w-32 mb-3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="min-h-screen pt-28 px-5 md:px-8 max-w-5xl mx-auto pb-32 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="border border-border rounded-[2rem] min-h-[500px]">
            <div className="p-2 border-b border-border flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2rem] p-6">
            <Skeleton className="h-4 w-32 mb-6 rounded" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
