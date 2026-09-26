import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GuideNumberedHeading({
  number,
  title,
  id,
  className,
}: {
  number: number;
  title: string;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "flex scroll-mt-28 items-center gap-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[14px] font-bold text-accent-foreground"
      >
        {number}
      </span>
      {/* Separate text node so badge digits never glue to a title that starts with a number */}
      <span className="min-w-0">
        {" "}
        {title}
      </span>
    </h2>
  );
}

export function GuideTipCallout({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <aside className="mt-6 flex gap-3 border border-accent/40 bg-accent/15 px-4 py-3.5">
      <span className="mt-0.5 text-lg" aria-hidden>
        💡
      </span>
      <div>
        <p className="text-[13px] font-bold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
      </div>
    </aside>
  );
}

export function GuideSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28", className)}>
      {children}
    </section>
  );
}
