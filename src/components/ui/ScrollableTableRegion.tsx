import { cn } from "@/lib/utils";

/**
 * Keyboard-reachable overflow wrapper for wide comparison tables.
 * Tab focuses the region so arrow keys can scroll; Tab again enters table links.
 */
export function ScrollableTableRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn("max-w-full min-w-0 overflow-x-auto overscroll-x-contain", className)}
    >
      {children}
    </div>
  );
}
