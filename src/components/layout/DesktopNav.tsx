"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Sport, ProductCategory } from "@/domain/sports/types";
import {
  PRIMARY_NAV,
  SPORT_NAV_GROUPS,
  GEAR_MENU_FEATURED_SLUGS,
  isPublicNavSport,
} from "@/lib/navigation/config";
import { PRIMARY_MENU_PANELS } from "@/lib/navigation/primary-menu-panels";
import {
  primaryNavHrefForKey,
  resolveNavigationContext,
} from "@/lib/navigation/contextual-nav";
import { StatusBadge } from "@/components/headers/PageHeaders";

interface DesktopNavProps {
  sports: Sport[];
  featuredCategories: ProductCategory[];
  categoryCounts: Record<string, number>;
}

type OpenMenu = string | "more" | null;

export function DesktopNav({
  sports,
  featuredCategories,
  categoryCounts,
}: DesktopNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  const navContext = useMemo(
    () => resolveNavigationContext({ pathname: pathname ?? "/", searchParams }),
    [pathname, searchParams],
  );
  const contextPrimaryHref = primaryNavHrefForKey(navContext.primaryNavKey);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = (id: OpenMenu) => {
    clearCloseTimer();
    setOpenMenu(id);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  useEffect(() => {
    setOpenMenu(null);
    clearCloseTimer();
  }, [pathname]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      clearCloseTimer();
    };
  }, []);

  const sportsBySlug = useMemo(
    () => new Map(sports.map((s) => [s.slug, s])),
    [sports],
  );

  const runningCats = useMemo(
    () =>
      featuredCategories.filter((c) =>
        (GEAR_MENU_FEATURED_SLUGS as readonly string[]).includes(c.slug),
      ),
    [featuredCategories],
  );

  return (
    <nav
      ref={navRef}
      className="flex items-center justify-center gap-0.5"
      aria-label="Primary"
    >
      {PRIMARY_NAV.map((link) => {
        const prefixes =
          "activePrefixes" in link && Array.isArray(link.activePrefixes)
            ? link.activePrefixes
            : [];
        let active =
          ("activeOnHome" in link && link.activeOnHome && isHome) ||
          pathname === link.href ||
          pathname.startsWith(`${link.href}/`) ||
          prefixes.some(
            (prefix) =>
              pathname === prefix || pathname.startsWith(`${prefix}/`),
          );

        if (link.href === "/running" && pathname.startsWith("/running/shoes")) {
          active = false;
        }

        if (contextPrimaryHref) {
          active = link.href === contextPrimaryHref;
        }

        const panel = PRIMARY_MENU_PANELS[link.href];
        const isOpen = openMenu === link.href;

        return (
          <div
            key={link.href}
            className="relative"
            onMouseEnter={() => open(link.href)}
            onMouseLeave={scheduleClose}
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node)) {
                return;
              }
              scheduleClose();
            }}
          >
            <Link
              href={link.href}
              aria-expanded={panel ? isOpen : undefined}
              aria-haspopup={panel ? "true" : undefined}
              className={cn(
                "relative inline-flex items-center gap-1 px-3 py-2 text-[13px] font-medium transition-colors",
                active || isOpen ? "text-white" : "text-white/70 hover:text-white",
              )}
              onKeyDown={(event) => {
                if (!panel) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  open(link.href);
                }
              }}
            >
              {link.label}
              {active && (
                <span
                  className="absolute inset-x-3 -bottom-0.5 h-px bg-accent"
                  aria-hidden
                />
              )}
            </Link>

            {panel && isOpen && (
              <MegaPanel
                onNavigate={() => setOpenMenu(null)}
                columns={
                  // Shoes uses curated shoe subcategory / decide links from
                  // PRIMARY_MENU_PANELS — do not inject full Running gear cats.
                  link.href === "/running"
                    ? withCategoryColumn(
                        panel.columns,
                        "Shop categories",
                        runningCats,
                        "running",
                        categoryCounts,
                        2, // keep Explore + Decide, categories as col 1 → max 3
                      )
                    : panel.columns
                }
                footer={panel.footer}
              />
            )}
          </div>
        );
      })}

      <MoreMenu
        open={openMenu === "more"}
        onOpen={() => open("more")}
        onClose={scheduleClose}
        onNavigate={() => setOpenMenu(null)}
        sportsBySlug={sportsBySlug}
      />
    </nav>
  );
}

function categoryLinks(
  cats: ProductCategory[],
  sportSlug: string,
  counts: Record<string, number>,
) {
  return cats.slice(0, 8).map((c) => ({
    label: c.name,
    href: `/${sportSlug}/${c.pathSegment}`,
    description:
      counts[c.id] !== undefined ? `${counts[c.id]} products` : undefined,
  }));
}

function withCategoryColumn(
  columns: {
    title: string;
    links: {
      label: string;
      href: string;
      description?: string;
      badge?: string;
    }[];
  }[],
  title: string,
  cats: ProductCategory[],
  sportSlug: string,
  counts: Record<string, number>,
  maxTotal = 3,
) {
  if (cats.length === 0) return columns;
  const next = {
    title,
    links: categoryLinks(cats, sportSlug, counts),
  };
  return [next, ...columns.filter((col) => col.title !== title)].slice(
    0,
    maxTotal,
  );
}

function MegaPanel({
  columns,
  footer,
  onNavigate,
}: {
  columns: {
    title: string;
    links: {
      label: string;
      href: string;
      description?: string;
      badge?: string;
    }[];
  }[];
  footer?: { label: string; href: string };
  onNavigate: () => void;
}) {
  return (
    <div className="absolute top-full left-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 pt-3">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
        <div
          className={cn(
            "grid gap-6 p-5",
            columns.length >= 3
              ? "sm:grid-cols-3"
              : columns.length === 2
                ? "sm:grid-cols-2"
                : "grid-cols-1",
          )}
        >
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                {col.title}
              </p>
              <ul className="space-y-0.5">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-muted"
                    >
                      <span>
                        <span className="font-medium text-foreground">
                          {link.label}
                        </span>
                        {link.description && (
                          <span className="mt-0.5 block text-[11px] text-subtle">
                            {link.description}
                          </span>
                        )}
                      </span>
                      {link.badge && (
                        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-subtle uppercase">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {footer && (
          <div className="border-t border-border bg-surface-muted/50 px-5 py-3">
            <Link
              href={footer.href}
              onClick={onNavigate}
              className="text-[13px] font-semibold text-link hover:underline"
            >
              {footer.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MoreMenu({
  open,
  onOpen,
  onClose,
  onNavigate,
  sportsBySlug,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: () => void;
  sportsBySlug: Map<string, Sport>;
}) {
  const moreMenuId = useId();

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        onClose();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? moreMenuId : undefined}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-white/70 transition-colors hover:text-white",
          open && "text-white",
        )}
      >
        More
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      <div
          id={moreMenuId}
          role="menu"
          hidden={!open}
          className="absolute top-full left-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 pt-3"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-lg">
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto sm:grid-cols-2">
              {SPORT_NAV_GROUPS.map((group) => {
                const groupSports = group.sportSlugs
                  .map((slug) => sportsBySlug.get(slug))
                  .filter((s): s is Sport => s != null && isPublicNavSport(s));
                if (groupSports.length === 0) return null;
                return (
                  <div key={group.id}>
                    <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-subtle uppercase">
                      {group.label}
                    </p>
                    <ul className="space-y-0.5">
                      {groupSports.map((sport) => (
                        <li key={sport.id}>
                          <Link
                            href={`/${sport.slug}`}
                            role="menuitem"
                            className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-surface-muted"
                            onClick={onNavigate}
                          >
                            <span className="font-medium text-foreground">
                              {sport.name}
                            </span>
                            <StatusBadge
                              status={
                                sport.contentStatus ??
                                (sport.available ? "live" : "coming-soon")
                              }
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
}
