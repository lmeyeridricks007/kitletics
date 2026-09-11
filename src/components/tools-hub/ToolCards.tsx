import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { resolveToolIcon } from "@/lib/tools/icons";
import type { ToolsHubCard } from "@/lib/tools/get-tools-hub-data";
import { cn } from "@/lib/utils";

interface ToolSectionProps {
  id?: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
  muted?: boolean;
}

export function ToolSection({
  id,
  title,
  description,
  viewAllHref,
  viewAllLabel,
  children,
  muted,
}: ToolSectionProps) {
  return (
    <section
      id={id}
      className={cn("py-10 sm:py-12", muted && "bg-surface-muted")}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.25rem] font-bold tracking-tight text-foreground uppercase sm:text-[1.4rem]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 max-w-xl text-[13px] text-muted">{description}</p>
            )}
          </div>
          {viewAllHref && viewAllLabel && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-accent"
            >
              {viewAllLabel}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function FinderToolCard({ card }: { card: ToolsHubCard }) {
  const Icon = resolveToolIcon(card.icon);

  return (
    <Link
      href={card.href}
      className="group flex h-full min-w-[240px] snap-start flex-col overflow-hidden border border-border bg-white transition-colors hover:border-accent sm:min-w-0"
    >
      <div className="relative aspect-[5/4] bg-surface-muted">
        {card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 220px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="size-10 text-subtle" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        <span className="absolute bottom-3 left-3 inline-flex size-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="size-4 text-foreground" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-[15px] font-semibold text-foreground group-hover:text-accent">
          {card.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-[12px] leading-snug text-muted">
          {card.description}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          {typeof card.estimatedTimeMinutes === "number" ? (
            <span className="text-[11px] text-subtle">
              Takes {card.estimatedTimeMinutes} min
            </span>
          ) : (
            <span />
          )}
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-[#0b1220] transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ComparisonToolCard({ card }: { card: ToolsHubCard }) {
  const Icon = resolveToolIcon(card.icon);

  return (
    <Link
      href={card.href}
      className="group flex items-start gap-3 border border-border bg-white p-4 transition-colors hover:border-accent"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted">
        <Icon className="size-4 text-foreground" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-semibold text-foreground group-hover:text-accent">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted">
          {card.description}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb]">
          Open tool
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function PlannerToolCard({ card }: { card: ToolsHubCard }) {
  const Icon = resolveToolIcon(card.icon);
  const cta =
    card.tool.type === "calculator"
      ? "Calculate →"
      : card.tool.type === "builder"
        ? "Build →"
        : "Plan →";

  return (
    <Link
      href={card.href}
      className="group flex h-full flex-col border border-border bg-white p-5 transition-colors hover:border-accent"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full border-2 border-accent/70 text-accent">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-[15px] font-semibold text-foreground group-hover:text-accent">
        {card.title}
      </h3>
      <p className="mt-2 flex-1 text-[12px] leading-snug text-muted">
        {card.description}
      </p>
      <span className="mt-4 text-[13px] font-semibold text-[#2563eb]">
        {cta}
      </span>
    </Link>
  );
}

export function SportToolsCard({
  name,
  toolCount,
  href,
  iconName,
}: {
  name: string;
  toolCount: number;
  href: string;
  iconName?: string;
}) {
  const Icon = resolveToolIcon(iconName ?? "Activity");

  return (
    <Link
      href={href}
      className="group flex flex-col border border-border bg-white p-4 transition-colors hover:border-accent"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted">
        <Icon className="size-4 text-foreground" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-3 text-[14px] font-semibold text-foreground group-hover:text-accent">
        {name}
      </h3>
      <p className="mt-1 text-[12px] text-muted">
        {toolCount} tool{toolCount === 1 ? "" : "s"} available
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb]">
        View tools
        <ArrowRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  );
}

export function UpcomingToolsCard({
  tools,
  contactHref,
}: {
  tools: ToolsHubCard[];
  contactHref: string;
}) {
  if (!tools.length) return null;

  return (
    <aside className="border border-border bg-[#f7f8e8] p-5 sm:p-6">
      <h3 className="font-display text-[15px] font-bold text-foreground">
        New tools coming soon
      </h3>
      <ul className="mt-4 space-y-3">
        {tools.map((t) => {
          const Icon = resolveToolIcon(t.icon);
          return (
            <li key={t.tool.id} className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-white">
                <Icon className="size-3.5 text-muted" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-[13px] font-medium text-foreground">
                {t.title}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        href={contactHref}
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-accent"
      >
        Suggest a tool
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </aside>
  );
}

export function HowWeComparePanel({
  title,
  body,
  methodologyHref,
}: {
  title: string;
  body: string;
  methodologyHref: string;
}) {
  return (
    <aside className="flex h-full flex-col border border-border bg-[#f4ffe0] p-5">
      <h3 className="font-display text-[15px] font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-[12px] leading-relaxed text-muted">{body}</p>
      <div className="mt-4 flex items-end gap-1.5" aria-hidden>
        {[28, 44, 36, 58, 48, 72].map((h, i) => (
          <span
            key={i}
            className="w-3 rounded-sm bg-accent/80"
            style={{ height: h * 0.45 }}
          />
        ))}
      </div>
      <Link
        href={methodologyHref}
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-accent"
      >
        How we choose
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </aside>
  );
}
