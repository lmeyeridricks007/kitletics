"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  resolveNavigationContext,
  type ContextualNavItem,
  type ResolveNavigationInput,
} from "@/lib/navigation/contextual-nav";
import {
  applyRunningGenderToHref,
} from "@/lib/running/gender-links";
import {
  parseAudienceParam,
  readPreferredSizing,
  type AudienceFit,
} from "@/lib/product/audience";

export interface ContextualNavProps {
  contentFlags?: ResolveNavigationInput["contentFlags"];
}

function useRunningGenderPref(): AudienceFit | undefined {
  const searchParams = useSearchParams();
  const fromUrl = parseAudienceParam(searchParams.get("gender"));
  const [preferred, setPreferred] = useState<AudienceFit | undefined>();

  useEffect(() => {
    setPreferred(readPreferredSizing());
  }, [searchParams]);

  return fromUrl ?? preferred;
}

function useResolvedContext(contentFlags?: ResolveNavigationInput["contentFlags"]) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  return useMemo(
    () =>
      resolveNavigationContext({
        pathname,
        searchParams,
        contentFlags,
      }),
    [pathname, searchParams, contentFlags],
  );
}

function navHrefForItem(
  href: string,
  gender: AudienceFit | undefined,
): string {
  return applyRunningGenderToHref(href, gender);
}

function NavLink({
  item,
  active,
  gender,
}: {
  item: ContextualNavItem;
  active: boolean;
  gender?: AudienceFit;
}) {
  return (
    <Link
      href={navHrefForItem(item.href, gender)}
      aria-current={active ? "page" : undefined}
      data-contextual-nav-item={item.id}
      data-active={active ? "true" : undefined}
      className={cn(
        "relative shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted hover:bg-surface-muted/80 hover:text-foreground",
      )}
    >
      {item.label}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
        />
      )}
    </Link>
  );
}

function ContextualNavMore({
  items,
  activeItemId,
  gender,
}: {
  items: ContextualNavItem[];
  activeItemId?: string;
  gender?: AudienceFit;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const pathname = usePathname();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    setOpen(false);
    clearCloseTimer();
  }, [pathname]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      clearCloseTimer();
    };
  }, []);

  if (items.length === 0) return null;

  const hasActive = items.some((i) => i.id === activeItemId);

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onFocus={openMenu}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2.5 text-[13px] font-medium transition-colors",
          hasActive || open
            ? "text-foreground"
            : "text-muted hover:bg-surface-muted/80 hover:text-foreground",
        )}
      >
        More
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      <div
          id={menuId}
          role="menu"
          hidden={!open}
          className="absolute top-full right-0 z-50 min-w-[10rem] pt-1"
        >
          <div className="overflow-hidden rounded-md border border-border bg-surface py-1 shadow-md">
            {items.map((item) => {
              const active = item.id === activeItemId;
              return (
                <Link
                  key={item.id}
                  role="menuitem"
                  href={navHrefForItem(item.href, gender)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-surface-muted text-foreground"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
    </div>
  );
}

/**
 * Lightweight contextual secondary nav — sits under the primary header.
 * Client for pathname/searchParams, More menu, and mobile scroll-into-view.
 */
export function ContextualNav({ contentFlags }: ContextualNavProps) {
  const resolved = useResolvedContext(contentFlags);
  const gender = useRunningGenderPref();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (resolved.showContextualNav) {
      root.style.setProperty("--contextual-nav-height", "2.75rem");
    } else {
      root.style.setProperty("--contextual-nav-height", "0px");
    }
    return () => {
      root.style.setProperty("--contextual-nav-height", "0px");
    };
  }, [resolved.showContextualNav]);

  useEffect(() => {
    if (!resolved.showContextualNav || !resolved.activeItemId) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const active = scroller.querySelector<HTMLElement>(
      `[data-contextual-nav-item="${resolved.activeItemId}"]`,
    );
    if (!active) return;
    active.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [resolved.showContextualNav, resolved.activeItemId]);

  if (!resolved.showContextualNav) return null;

  const allMobileItems = [
    ...resolved.visibleItems,
    ...resolved.overflowItems,
  ].sort((a, b) => a.priority - b.priority);

  return (
    <nav
      aria-label="Section navigation"
      className="border-b border-border bg-background"
      style={{ height: "var(--contextual-nav-height, 2.75rem)" }}
    >
      <div className="mx-auto flex h-full max-w-[90rem] items-stretch px-4 sm:px-6 lg:px-8">
        {/* Mobile / tablet: horizontal scroll, all items */}
        <div
          ref={scrollerRef}
          className="flex h-full flex-1 items-stretch gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        >
          {allMobileItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              active={item.id === resolved.activeItemId}
              gender={gender}
            />
          ))}
        </div>

        {/* Desktop: priority row + More */}
        <div className="hidden h-full flex-1 items-stretch lg:flex">
          {resolved.visibleItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              active={item.id === resolved.activeItemId}
              gender={gender}
            />
          ))}
          <ContextualNavMore
            items={resolved.overflowItems}
            activeItemId={resolved.activeItemId}
            gender={gender}
          />
        </div>
      </div>
    </nav>
  );
}

/** Expose resolved primary key for DesktopNav active state */
export function useNavigationPrimaryKey(
  contentFlags?: ResolveNavigationInput["contentFlags"],
) {
  return useResolvedContext(contentFlags).primaryNavKey;
}
