"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Backpack,
  Briefcase,
  Circle,
  CircleDot,
  Droplets,
  Footprints,
  HeartPulse,
  Layers,
  Shirt,
  Sparkles,
  Tag,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { parseAudienceParam } from "@/lib/product/audience";
import { withRunningGender } from "@/lib/running/gender-links";
import type { RunningGearHubData } from "@/lib/running-gear/running-gear-hub-types";

const ICON_MAP: Record<string, LucideIcon> = {
  CircleDot,
  Footprints,
  Briefcase,
  Circle,
  Layers,
  Sparkles,
  Shirt,
  Tag,
  Watch,
  Droplets,
  Backpack,
  HeartPulse,
};

const FIT_OPTIONS = [
  { value: "men" as const, label: "Men's", href: "/running/gear?gender=men" },
  {
    value: "women" as const,
    label: "Women's",
    href: "/running/gear?gender=women",
  },
  { value: "all" as const, label: "All gear", href: "/running/gear" },
];

export function RunningGearHubClient({ data }: { data: RunningGearHubData }) {
  const searchParams = useSearchParams();
  const gender = parseAudienceParam(searchParams.get("gender"));
  const genderLabel =
    gender === "men" ? "Men's" : gender === "women" ? "Women's" : undefined;
  const title = genderLabel ? `${genderLabel} Running Gear` : data.title;
  const description = gender
    ? `Browse running equipment with ${genderLabel?.toLowerCase()} fit applied where categories support it — shoes, clothing, packs and recovery. Watches, hydration and fuel stay unfiltered.`
    : data.description;
  const backHref = gender ? `/running?gender=${gender}` : data.backHref;

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-[#f7f8f9]">
        <Container size="wide" className="pt-6 pb-10 sm:pt-8 sm:pb-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Running", href: "/running" },
              { label: "Gear" },
            ]}
          />

          <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            Running
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {description}
          </p>

          <div
            className="mt-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter running gear by fit"
          >
            {FIT_OPTIONS.map((opt) => {
              const selected =
                opt.value === "all" ? !gender : gender === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={opt.href}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "border px-3 py-1.5 text-[12px] font-bold tracking-[0.06em] uppercase transition-colors",
                    selected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-white text-foreground hover:border-foreground",
                  )}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href={data.ctas.shoeFinder.href} size="lg">
              {data.ctas.shoeFinder.label}
            </ButtonLink>
            <ButtonLink
              href={data.ctas.hydrationFinder.href}
              variant="outline"
              size="lg"
            >
              {data.ctas.hydrationFinder.label}
            </ButtonLink>
            <Link
              href={backHref}
              className="text-[13px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              ← Back to Running
            </Link>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
            Shop by
          </p>
          <h2 className="mt-1 font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Running equipment
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.groups.map((group) => (
            <div key={group.id} className="min-w-0">
              <p className="mb-4 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul className="space-y-2">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? CircleDot;
                  const href =
                    gender && item.genderFilterable
                      ? withRunningGender(item.href, gender)
                      : item.href;
                  return (
                    <li key={`${group.id}-${item.id}`}>
                      <Link
                        href={href}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-3 transition-colors hover:border-accent hover:bg-white"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className="size-4 shrink-0 text-foreground"
                            strokeWidth={1.5}
                          />
                          <span className="truncate text-[13px] font-medium text-foreground group-hover:text-link">
                            {item.label}
                          </span>
                        </span>
                        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                          {item.productCount}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
