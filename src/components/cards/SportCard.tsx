import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Footprints,
  Dumbbell,
  Flame,
  PersonStanding,
  Swords,
  CircleDot,
  Bike,
  Waves,
  HeartPulse,
  Sailboat,
  Fish,
  Target,
  Snowflake,
  Gamepad2,
  Table2,
  type LucideIcon,
} from "lucide-react";
import type { Sport } from "@/domain/sports/types";
import { StatusBadge } from "@/components/headers/PageHeaders";

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Dumbbell,
  Flame,
  PersonStanding,
  Swords,
  CircleDot,
  Bike,
  Waves,
  HeartPulse,
  Sailboat,
  Fish,
  Target,
  Snowflake,
  Gamepad2,
  Table: Table2,
  Table2,
};

interface SportCardProps {
  sport: Sport;
  className?: string;
}

export function SportCard({ sport, className }: SportCardProps) {
  const Icon = iconMap[sport.icon] ?? Footprints;
  const status = sport.contentStatus ?? (sport.available ? "live" : "coming-soon");
  const isLive = status === "live";

  return (
    <Link
      href={`/${sport.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-md",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${sport.color}18`,
            color: sport.color,
          }}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <StatusBadge status={status} />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground uppercase group-hover:text-accent">
        {sport.name}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{sport.description}</p>
      <span className="link-cta mt-5 text-sm">
        {isLive
          ? "Explore →"
          : status === "partial"
            ? "Preview →"
            : "Coming soon — browse anyway →"}
      </span>
    </Link>
  );
}
