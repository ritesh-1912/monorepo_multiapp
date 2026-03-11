/**
 * Skeleton placeholder for loading states. Theme-aware pulse animation.
 */
import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export type SkeletonProps = DivProps;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />
  )
);
Skeleton.displayName = 'Skeleton';

/** Pre-built skeleton for a table row (e.g. 4 cells). */
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Pre-built skeleton for a chart card (title + chart area). */
export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
