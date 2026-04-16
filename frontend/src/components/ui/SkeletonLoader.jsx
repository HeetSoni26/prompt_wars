/**
 * @fileoverview SkeletonLoader component — animated placeholder for async content.
 */

/**
 * Renders a shimmer skeleton block.
 * @param {Object} props
 * @param {string} props.className - Additional Tailwind classes
 * @param {number} props.lines - Number of text skeleton lines to render
 */
export function SkeletonBlock({ className = '', height = 'h-4' }) {
  return <div className={`skeleton ${height} ${className}`} aria-hidden="true" />;
}

/**
 * Skeleton for a message bubble.
 */
export function MessageSkeleton() {
  return (
    <div className="space-y-3 animate-fadeIn" aria-busy="true" aria-label="Loading message">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" height="h-8" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="w-3/4" />
          <SkeletonBlock className="w-full" />
          <SkeletonBlock className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a session list item.
 */
export function SessionItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5" aria-hidden="true">
      <SkeletonBlock className="w-4 h-4 rounded flex-shrink-0" height="h-4" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="w-3/4 h-3" height="h-3" />
        <SkeletonBlock className="w-1/3 h-2.5" height="h-2.5" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the memory panel.
 */
export function MemorySkeleton() {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading memory">
      <SkeletonBlock className="w-1/2 h-4" height="h-4" />
      <SkeletonBlock className="w-full h-3" height="h-3" />
      <SkeletonBlock className="w-full h-3" height="h-3" />
      <SkeletonBlock className="w-2/3 h-3" height="h-3" />
    </div>
  );
}

export default SkeletonBlock;
