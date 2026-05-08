// components/ui/Skeleton.tsx
// Shimmer skeleton components — always show before content (never spinners)

import React, { HTMLAttributes } from 'react';

// Base shimmer block
function SkeletonBlock({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      aria-hidden="true"
      {...rest}
    />
  );
}

// Skeleton for Destination Card (Type A)
export function DestinationCardSkeleton() {
  return (
    <div className="rounded-card overflow-hidden bg-bg-tertiary" aria-hidden="true">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Skeleton for Activity Row (Type B)
export function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3" aria-hidden="true">
      <SkeletonBlock className="w-8 h-8 rounded-category shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <SkeletonBlock className="h-4 w-10" />
    </div>
  );
}

// Skeleton for a full trip card on Trips list
export function TripCardSkeleton() {
  return (
    <div className="rounded-card bg-bg-tertiary overflow-hidden" aria-hidden="true">
      <SkeletonBlock className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-3 w-1/4" />
      </div>
    </div>
  );
}

// Generic skeleton list
export function SkeletonList({ count = 3, Skeleton = ActivityRowSkeleton }: {
  count?: number;
  Skeleton?: React.ComponentType;
}) {
  return (
    <div role="status" aria-label="Loading content">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
}

export { SkeletonBlock };
export default SkeletonBlock;
