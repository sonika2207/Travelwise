import React from 'react';

const LoadingSkeleton = () => {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div>
      {/* Hero skeleton */}
      <div className="rounded-[28px] mb-6 animate-pulse bg-[var(--tw-border)]" style={{ height: '180px' }} />

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-3.5 mb-6 max-lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 bg-[var(--tw-bg-card)] rounded-2xl p-5 border border-[var(--tw-border-light)] animate-pulse" style={{ boxShadow: 'var(--tw-shadow-stat)' }}>
            <div className="w-[46px] h-[46px] rounded-xl bg-[var(--tw-border-light)] flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-[var(--tw-border-light)] rounded w-1/2" />
              <div className="h-3 bg-[var(--tw-border-light)] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Countdown skeleton */}
      <div className="rounded-[20px] mb-7 p-6 border border-[var(--tw-border-light)] animate-pulse bg-[var(--tw-bg-subtle)]" style={{ height: '100px' }} />

      {/* Filter skeleton */}
      <div className="flex gap-1.5 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-[var(--tw-border-light)] rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {skeletonCards.map((_, i) => (
          <div key={i} className="bg-[var(--tw-bg-card)] rounded-[20px] overflow-hidden border border-[var(--tw-border-light)] animate-pulse" style={{ boxShadow: 'var(--tw-shadow-card)' }}>
            <div className="h-[150px] bg-[var(--tw-border)]" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-[var(--tw-border-light)] rounded w-1/2" />
              <div className="h-3 bg-[var(--tw-border-light)] rounded w-3/4" />
              <div className="h-[5px] bg-[var(--tw-border-light)] rounded-full" />
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--tw-card-footer-border)] bg-[var(--tw-card-footer-bg)]">
              <div className="h-5 w-16 bg-[var(--tw-border)] rounded-full" />
              <div className="flex gap-1.5">
                <div className="w-9 h-9 bg-[var(--tw-border)] rounded-lg" />
                <div className="w-9 h-9 bg-[var(--tw-border)] rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
