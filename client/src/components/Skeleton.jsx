import { cn } from "../lib/utils";

/**
 * Skeleton - Neo-Brutalist skeleton loader component
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-veil-muted rounded-brutal",
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonCard - Card-shaped skeleton
 */
export function SkeletonCard({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-veil-muted rounded-brutal p-4 sm:p-6",
        className
      )}
      {...props}
    >
      <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-brutal mb-4" />
      <Skeleton className="h-5 sm:h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

/**
 * SkeletonText - Text line skeleton
 */
export function SkeletonText({ lines = 3, className, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonStats - Stats card skeleton
 */
export function SkeletonStats({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-veil-muted rounded-brutal p-4 sm:p-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-brutal" />
        <div className="flex-1">
          <Skeleton className="h-7 sm:h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Table skeleton
 */
export function SkeletonTable({ rows = 5, cols = 4, className, ...props }) {
  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-veil-muted/30 border-b-2 border-veil-muted">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 p-4 border-b border-veil-muted/50"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonReportItem - Report list item skeleton
 */
export function SkeletonReportItem({ className, ...props }) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 border-b-2 border-veil-muted",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 sm:w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export default Skeleton;
