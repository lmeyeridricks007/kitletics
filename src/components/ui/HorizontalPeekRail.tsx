import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal product-card rail for mobile PDPs.
 * Constrains min-content width so shrink-0 cards cannot inflate the document,
 * then peeks the next card with snap + a right-edge fade (hidden from sm up).
 */
export function HorizontalPeekRail({
  as: Tag = "ul",
  children,
  className,
}: {
  as?: "ul" | "div";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-w-0 max-w-full overflow-x-clip sm:overflow-visible">
      <Tag
        className={cn(
          "flex w-full min-w-0 max-w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]",
          className,
        )}
      >
        {children}
      </Tag>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
      />
    </div>
  );
}
