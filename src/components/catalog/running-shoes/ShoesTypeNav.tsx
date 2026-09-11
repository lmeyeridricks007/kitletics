"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Cloud,
  Footprints,
  Gauge,
  Hexagon,
  Mountain,
  MoveHorizontal,
  Shield,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";

const TYPE_ICONS: Record<string, LucideIcon> = {
  daily: Footprints,
  cushion: Cloud,
  tempo: Gauge,
  race: Timer,
  carbon: Hexagon,
  stability: Shield,
  trail: Mountain,
  wide: MoveHorizontal,
};

export function ShoesTypeNav({
  typeNav,
}: {
  typeNav: ShoesCategoryPageData["typeNav"];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollerRef = useRef<HTMLElement>(null);

  const activeType = searchParams.get("type");
  const activeWidth = searchParams.get("width");

  return (
    <section className="border-b border-border bg-white">
      <Container
        size="wide"
        className="flex items-center gap-5 py-3.5 sm:gap-7"
      >
        <p className="shrink-0 text-[12px] font-bold tracking-[0.04em] text-foreground uppercase">
          {typeNav.title}
        </p>
        <div className="relative min-w-0 flex-1">
          <nav
            ref={scrollerRef}
            aria-label="Shoe types"
            className="flex items-center gap-5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
          >
            {typeNav.items.map((item, i) => {
              const isActive = isTypeActive(item.href, {
                pathname,
                activeType,
                activeWidth,
                isFirst: i === 0,
              });
              const Icon = TYPE_ICONS[item.id] ?? Footprints;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "group relative flex shrink-0 flex-col items-center gap-1.5 px-0.5 pt-0.5 pb-1.5 text-center transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 opacity-80" strokeWidth={1.6} />
                  <span className="text-[12px] font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            aria-label="Scroll shoe types"
            onClick={() =>
              scrollerRef.current?.scrollBy({ left: 180, behavior: "smooth" })
            }
            className="absolute top-1/2 -right-1 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm lg:inline-flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Container>
    </section>
  );
}

function isTypeActive(
  href: string,
  ctx: {
    pathname: string;
    activeType: string | null;
    activeWidth: string | null;
    isFirst: boolean;
  },
): boolean {
  try {
    const url = new URL(href, "https://kitletics.local");
    if (url.pathname !== ctx.pathname) return false;
    const type = url.searchParams.get("type");
    const width = url.searchParams.get("width");
    if (type) return ctx.activeType === type;
    if (width) return ctx.activeWidth === width;
    // Listing routes (/running/shoes/race etc.) with no query
    if (url.pathname !== "/running/shoes") return true;
  } catch {
    /* ignore */
  }
  // Hub: highlight Daily when no type/width filter is set
  return ctx.isFirst && !ctx.activeType && !ctx.activeWidth;
}
