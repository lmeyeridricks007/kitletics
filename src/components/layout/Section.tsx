import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  /** Eyebrow label above the title */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Right-side header action (e.g. View all link) */
  action?: ReactNode;
  /** Skip outer padding — useful when nesting */
  flush?: boolean;
  muted?: boolean;
}

export function Section({
  children,
  className,
  containerClassName,
  id,
  eyebrow,
  title,
  description,
  action,
  flush = false,
  muted = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        flush ? undefined : "py-10 sm:py-12 lg:py-14",
        muted && "bg-surface-muted",
        className,
      )}
    >
      <Container className={containerClassName}>
        {(eyebrow || title || description || action) && (
          <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              {eyebrow && (
                <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-[15px] text-muted sm:text-base">{description}</p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
