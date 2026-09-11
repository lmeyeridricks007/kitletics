"use client";

import {
  Cloud,
  Scale,
  Zap,
  Shield,
  Tag,
  Clock,
  Feather,
  Battery,
  Map,
  Minimize2,
  Sparkles,
  Target,
  Flame,
  Box,
} from "lucide-react";
import type { AlternativesReasonConfig } from "@/lib/product/alternatives-config";
import type { AlternativeReasonGroup } from "@/lib/product/get-alternatives-page-data";
import { cn } from "@/lib/utils";

const ICONS = {
  cloud: Cloud,
  scale: Scale,
  zap: Zap,
  shield: Shield,
  tag: Tag,
  clock: Clock,
  feather: Feather,
  battery: Battery,
  map: Map,
  minimize: Minimize2,
  sparkles: Sparkles,
  target: Target,
  flame: Flame,
  box: Box,
} as const;

interface AlternativeReasonNavProps {
  groups: AlternativeReasonGroup[];
  activeReasonId: string | null;
  onSelect: (reasonId: string | null) => void;
}

export function AlternativeReasonNav({
  groups,
  activeReasonId,
  onSelect,
}: AlternativeReasonNavProps) {
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="quick-alts-heading">
      <h2
        id="quick-alts-heading"
        className="text-[12px] font-bold tracking-[0.14em] text-foreground uppercase"
      >
        Quick alternatives by need
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {groups.map(({ reason, count }) => (
          <li key={reason.id}>
            <ReasonCard
              reason={reason}
              count={count}
              active={activeReasonId === reason.id}
              onSelect={() =>
                onSelect(activeReasonId === reason.id ? null : reason.id)
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReasonCard({
  reason,
  count,
  active,
  onSelect,
}: {
  reason: AlternativesReasonConfig;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = ICONS[reason.icon] ?? Sparkles;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex h-full w-full flex-col border bg-white p-4 text-left transition-colors",
        active
          ? "border-accent ring-1 ring-accent"
          : "border-border hover:border-foreground/30",
      )}
    >
      <Icon className="size-5 text-foreground" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 text-[14px] font-bold text-foreground">{reason.title}</p>
      <p className="mt-1 flex-1 text-[12px] leading-snug text-muted">
        {reason.description}
      </p>
      <span className="mt-3 text-[12px] font-medium text-link">
        See alternatives ({count}) →
      </span>
    </button>
  );
}
