import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Shared Kitletics Calculator / Planner desktop workspace:
 * dark left input rail · center results · right context.
 */
export function ToolWorkspaceShell({
  left,
  center,
  right,
  className,
}: {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border bg-white", className)}>
      <div
        className={cn(
          "mx-auto grid max-w-[1400px]",
          right
            ? "lg:grid-cols-[250px_minmax(0,1fr)_290px]"
            : "lg:grid-cols-[250px_minmax(0,1fr)]",
        )}
      >
        <div className="hidden lg:block">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            {left}
          </div>
        </div>
        <div className="min-w-0">{center}</div>
        {right && (
          <div className="hidden border-l border-border bg-surface-muted p-4 lg:block">
            <div className="sticky top-4 space-y-4">{right}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ToolInputRail({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="flex min-h-[calc(100vh-8rem)] flex-col bg-[#12181c] text-white">
      <div className="flex-1 space-y-6 p-5 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-white/10 p-5 sm:p-6">{footer}</div>
      )}
    </aside>
  );
}

export function ToolRailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">
        {title}
      </p>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}
