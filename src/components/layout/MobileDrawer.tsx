"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import type { Sport, ProductCategory } from "@/domain/sports/types";
import { siteConfig } from "@/content/config";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { SPORT_NAV_GROUPS, GEAR_MENU_FEATURED_SLUGS, isPublicNavSport } from "@/lib/navigation/config";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  sports: Sport[];
  categories: ProductCategory[];
  categoryCounts?: Record<string, number>;
}

export function MobileDrawer({
  open,
  onClose,
  onOpenSearch,
  sports,
  categories,
  categoryCounts = {},
}: MobileDrawerProps) {
  const pathname = usePathname();
  const [sportsOpen, setSportsOpen] = useState(false);
  const [gearOpen, setGearOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    onClose();
    // Close on route change only — omit onClose to avoid re-firing when parent identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pathname gate only
  }, [pathname]);

  useModalFocus(open, panelRef, onClose);

  const featuredCats = categories.filter((c) =>
    (GEAR_MENU_FEATURED_SLUGS as readonly string[]).includes(c.slug),
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-charcoal-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        ref={panelRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col bg-surface shadow-lg transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal={open}
        tabIndex={-1}
        {...(!open ? { inert: true } : {})}
      >
        <div className="flex h-[var(--header-height)] items-center justify-between border-b border-border px-4">
          <Logo />
          <span id={titleId} className="sr-only">
            {siteConfig.displayName} menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-muted"
          >
            <span>Search Kitletics…</span>
            <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>

          <ul className="space-y-0.5">
            {[
              { label: "Running", href: "/running" },
              { label: "All gear", href: "/gear" },
              { label: "Tools", href: "/tools" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === link.href
                      ? "bg-accent-muted text-accent"
                      : "text-foreground hover:bg-surface-muted",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Accordion
            label="Sports"
            open={sportsOpen}
            onToggle={() => setSportsOpen((v) => !v)}
          >
            {SPORT_NAV_GROUPS.map((group) => (
              <div key={group.id} className="mb-3">
                <p className="px-3 py-1 text-[10px] font-medium tracking-wide text-subtle uppercase">
                  {group.label}
                </p>
                <ul>
                  {group.sportSlugs.map((slug) => {
                    const sport = sports.find((s) => s.slug === slug);
                    if (!sport || !isPublicNavSport(sport)) return null;
                    return (
                      <li key={sport.id}>
                        <Link
                          href={`/${sport.slug}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
                        >
                          {sport.name}
                          <span className="text-[10px] text-subtle uppercase">
                            Live
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </Accordion>

          <Accordion
            label="Gear"
            open={gearOpen}
            onToggle={() => setGearOpen((v) => !v)}
          >
            <ul>
              {featuredCats
                .filter((cat) => (categoryCounts[cat.id] ?? 0) > 0)
                .map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/running/${cat.pathSegment}`}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/gear"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-accent"
                >
                  All gear →
                </Link>
              </li>
            </ul>
          </Accordion>

          <ul className="mt-2 space-y-0.5">
            {[
              { label: "Tools", href: "/tools" },
              { label: "Compare", href: "/compare" },
              { label: "Brands", href: "/brands" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted">{siteConfig.displayName}</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = useId();
  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
      >
        {label}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      <div id={panelId} hidden={!open} className="pb-2">
        {open && children}
      </div>
    </div>
  );
}
