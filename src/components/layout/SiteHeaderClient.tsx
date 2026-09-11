"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Heart, Menu, Search, User } from "lucide-react";
import type { Sport, ProductCategory } from "@/domain/sports/types";
import { MobileDrawer } from "./MobileDrawer";
import { SearchDialog } from "@/components/search/SearchDialog";
import { HeaderSearchField } from "@/components/search/HeaderSearchField";
import { Container } from "./Container";
import { UTILITY_NAV } from "@/lib/navigation/config";
import type { ResolveNavigationInput } from "@/lib/navigation/contextual-nav";
import { ContextualNav } from "@/components/layout/ContextualNav";
import { RegionSelector } from "@/components/commerce/RegionSelector";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";

interface SiteHeaderClientProps {
  sports: Sport[];
  categories: ProductCategory[];
  categoryCounts: Record<string, number>;
  featuredCategories: ProductCategory[];
  logo: ReactNode;
  desktopNav: ReactNode;
  themeToggle: ReactNode;
  initialRegion?: RegionCode;
  contextualContentFlags?: ResolveNavigationInput["contentFlags"];
}

export function SiteHeaderClient({
  sports,
  categories,
  featuredCategories,
  categoryCounts,
  logo,
  desktopNav,
  initialRegion = DEFAULT_REGION,
  contextualContentFlags,
}: SiteHeaderClientProps) {
  void featuredCategories;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-40">
        {/* Utility bar */}
        <div className="bg-background-darker text-[11px] text-white/70">
          <Container
            size="wide"
            className="flex h-[var(--utility-height)] items-center justify-between gap-4"
          >
            <p className="truncate">
              Unbiased. Data-driven. Expert sport gear recommendations.
            </p>
            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden sm:block">
                <RegionSelector initialRegion={initialRegion} variant="utility" />
              </div>
              {UTILITY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden text-white/70 transition-colors hover:text-white md:inline"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/compare"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="Saved"
              >
                <Heart className="size-3.5" strokeWidth={1.75} />
              </Link>
              <Link
                href="/about"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="Account"
              >
                <User className="size-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </Container>
        </div>

        {/* Main header */}
        <header className="bg-background-dark">
          <Container
            size="wide"
            className="flex h-[var(--header-height)] items-center gap-5"
          >
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white lg:hidden"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="size-4" />
            </button>

            {logo}

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              {desktopNav}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Suspense
                fallback={
                  <div className="hidden h-10 w-[min(100vw,280px)] rounded-full border border-white/10 bg-white/5 md:block" />
                }
              >
                <HeaderSearchField />
              </Suspense>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search overlay"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white md:hidden"
              >
                <Search className="size-4" />
              </button>
            </div>
          </Container>
        </header>

        <Suspense fallback={null}>
          <ContextualNav contentFlags={contextualContentFlags} />
        </Suspense>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
        sports={sports}
        categories={categories}
        categoryCounts={categoryCounts}
      />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
