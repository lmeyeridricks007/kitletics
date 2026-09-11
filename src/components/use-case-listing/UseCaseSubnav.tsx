"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  Timer,
  Route,
  PersonStanding,
  Zap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import type { ListingSubnavItem } from "@/lib/use-case-listing/types";

const ICONS: Record<NonNullable<ListingSubnavItem["icon"]>, LucideIcon> = {
  overview: Compass,
  timer: Timer,
  route: Route,
  runner: PersonStanding,
  bolt: Zap,
  tips: Lightbulb,
};

export function UseCaseSubnav({
  items,
  basePath,
}: {
  items: ListingSubnavItem[];
  basePath: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <section className="border-b border-border bg-white">
      <Container size="wide" className="py-3">
        <nav
          aria-label="Listing sections"
          className="flex items-center gap-5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7"
        >
          {items.map((item) => {
            const Icon = ICONS[item.icon ?? "overview"];
            const active = isSubnavActive(item, pathname, qs, basePath);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex shrink-0 flex-col items-center gap-1 px-0.5 pt-0.5 pb-1.5 text-center transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.6} />
                <span className="text-[12px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </Container>
    </section>
  );
}

function isSubnavActive(
  item: ListingSubnavItem,
  pathname: string,
  qs: string,
  basePath: string,
): boolean {
  if (item.href.startsWith("#")) {
    return false;
  }
  try {
    const url = new URL(item.href, "https://kitletics.local");
    if (url.pathname !== pathname) return false;
    const itemQs = url.searchParams.toString();
    if (!itemQs) {
      // Overview: active when no refinement query on base listing
      return pathname === basePath && !qs;
    }
    // Match key params loosely
    return qs === itemQs || qs.includes(itemQs);
  } catch {
    return false;
  }
}
