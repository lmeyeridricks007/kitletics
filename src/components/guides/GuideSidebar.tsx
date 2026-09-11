"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Circle,
  Layers,
  Ruler,
  Scale,
  Shield,
  Gauge,
} from "lucide-react";
import type { LongFormGuidePageData } from "@/lib/guides/get-long-form-guide-page-data";
import { cn } from "@/lib/utils";

const TERM_ICONS = {
  layers: Layers,
  ruler: Ruler,
  circle: Circle,
  shield: Shield,
  scale: Scale,
  gauge: Gauge,
} as const;

interface GuideSidebarProps {
  data: LongFormGuidePageData;
  /** Compact hero stack: finder + toc only */
  variant?: "hero" | "full";
  omitFinder?: boolean;
  omitToc?: boolean;
  className?: string;
}

export function GuideSidebar({
  data,
  variant = "full",
  omitFinder = false,
  omitToc = false,
  className,
}: GuideSidebarProps) {
  const { config, bestGuides } = data;
  const toc = config?.toc ?? data.guide.sections.map((s) => ({
    id: s.id,
    title: s.heading,
  }));
  const finder = config?.finder;
  const finderTool = finder
    ? data.tools.find((t) => t.slug === finder.toolSlug) ?? data.tools[0]
    : data.tools[0];

  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");

  useEffect(() => {
    if (toc.length === 0) return;
    const ids = toc.map((t) => t.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    function onScroll() {
      let current = ids[0] ?? "";
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      }
      setActiveId(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  return (
    <div className={cn("space-y-4", className)}>
      {finderTool && finder && !omitFinder && (
        <aside className="rounded-xl bg-charcoal-950 p-5 text-white">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {finder.title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">
            {finder.description}
          </p>
          <Link
            href={`/tools/${finderTool.slug}`}
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-accent px-4 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:bg-accent-hover"
          >
            {finder.ctaLabel}
          </Link>
          <p className="mt-2 text-[11px] text-white/45">
            Quick personalized recommendations
          </p>
        </aside>
      )}

      {!omitToc && (
      <nav
        aria-label="On this page"
        className="border border-border bg-white p-4"
      >
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
          On this page
        </h2>
        <ol className="mt-3 space-y-1.5">
          {toc.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex gap-2 text-[13px] leading-snug hover:text-foreground",
                  activeId === item.id
                    ? "font-semibold text-foreground"
                    : "text-muted",
                )}
              >
                <span className="tabular-nums text-subtle">{i + 1}.</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
        <a
          href="#top"
          className="mt-3 inline-block text-[12px] font-medium text-link hover:underline"
        >
          Back to top ↑
        </a>
      </nav>
      )}

      {variant === "full" && (
        <>
          {config?.decisionLinks && config.decisionLinks.length > 0 && (
            <aside className="border border-border bg-white p-4">
              <h2 className="text-[14px] font-bold text-foreground">
                Need help deciding?
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                Compare options side by side or explore curated best lists for
                your needs.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {config.decisionLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex h-9 items-center justify-center border border-border bg-surface px-3 text-[12px] font-semibold hover:border-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </aside>
          )}

          {config?.glossaryTerms && config.glossaryTerms.length > 0 && (
            <aside className="border border-border bg-white p-4">
              <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
                Key terms explained
              </h2>
              <ul className="mt-3 space-y-3">
                {config.glossaryTerms.map((term) => {
                  const Icon = TERM_ICONS[term.icon] ?? Circle;
                  return (
                    <li key={term.id} className="flex gap-2.5">
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-foreground"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <div>
                        <p className="text-[13px] font-semibold">{term.term}</p>
                        <p className="text-[12px] leading-snug text-muted">
                          {term.definition}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {config.glossaryHref && (
                <Link
                  href={config.glossaryHref}
                  className="mt-3 inline-block text-[12px] font-medium text-link hover:underline"
                >
                  See all terms in glossary →
                </Link>
              )}
            </aside>
          )}

          {bestGuides.length > 0 && (
            <aside className="border border-border bg-white p-4">
              <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
                Recommended shortlists
              </h2>
              <ul className="mt-3 space-y-3">
                {bestGuides.slice(0, 3).map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/best/${g.slug}`}
                      className="block text-[13px] font-semibold hover:text-accent-ink"
                    >
                      {g.title}
                    </Link>
                    {g.shortDescription && (
                      <p className="mt-0.5 text-[12px] text-muted line-clamp-2">
                        {g.shortDescription}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {data.relatedPeerGuides.length > 0 && (
            <aside className="border border-border bg-white p-4">
              <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
                Related guides
              </h2>
              <ul className="mt-3 space-y-3">
                {data.relatedPeerGuides.slice(0, 3).map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="block text-[13px] font-semibold hover:text-accent-ink"
                    >
                      {g.title}
                    </Link>
                    {g.shortDescription && (
                      <p className="mt-0.5 text-[12px] text-muted line-clamp-2">
                        {g.shortDescription}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {config?.newsletter && (
            <aside className="border border-accent/50 bg-accent/20 p-4">
              <h2 className="text-[14px] font-bold text-foreground">
                {config.newsletter.title}
              </h2>
              <p className="mt-1 text-[12px] text-muted">
                {config.newsletter.description}
              </p>
              <form
                className="mt-3 flex flex-col gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className="sr-only" htmlFor="guide-newsletter-email">
                  Email
                </label>
                <input
                  id="guide-newsletter-email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="h-9 border border-border bg-white px-3 text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-[4px] bg-accent px-3 text-[12px] font-bold tracking-[0.04em] text-accent-foreground uppercase"
                >
                  Subscribe
                </button>
              </form>
            </aside>
          )}
        </>
      )}
    </div>
  );
}
