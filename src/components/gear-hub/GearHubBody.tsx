import Link from "next/link";
import {
  ArrowLeftRight,
  BookOpen,
  Trophy,
  FileText,
  BadgeCheck,
  Database,
  Tag,
  Sparkles,
  Target,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { CatalogFromPrice } from "@/components/commerce/CatalogPriceIsland";
import { resolveToolIcon } from "@/lib/tools/icons";
import {
  GearHubMobileFilters,
  GearHubSidebar,
} from "@/components/gear-hub/GearHubSidebar";
import type { GearHubPageData } from "@/lib/gear-hub/types";

const LEARN_ICONS: Record<string, LucideIcon> = {
  compare: ArrowLeftRight,
  guides: BookOpen,
  best: Trophy,
  reviews: FileText,
};

const TRUST_ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  Database,
  Tag,
  Sparkles,
  Target,
};

export function GearHubBody({ data }: { data: GearHubPageData }) {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)_270px] lg:gap-7 lg:px-8 lg:py-8">
          <aside className="hidden min-w-0 lg:block">
            <GearHubSidebar
              browse={data.browse}
              facets={data.facets}
              filters={data.filters}
            />
          </aside>

          <div className="min-w-0 space-y-8">
            <GearHubMobileFilters
              browse={data.browse}
              facets={data.facets}
              filters={data.filters}
            />

            <section>
              <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                Shop by category
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {data.categories.map((card) => (
                  <li key={card.id}>
                    <Link
                      href={card.href}
                      className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-white transition-colors hover:border-accent"
                    >
                      <div className="relative flex aspect-[4/3] items-center justify-center bg-[#f4f5f6] px-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
                        <img
                          src={card.imageSrc}
                          alt={card.imageAlt}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      </div>
                      <div className="flex flex-1 flex-col px-3 py-2.5">
                        <p className="text-[14px] font-bold text-foreground group-hover:text-link">
                          {card.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {card.shortDescription}
                        </p>
                        <p className="mt-auto pt-2 text-[11px] font-medium text-muted">
                          {card.publishedProductCount.toLocaleString("en-GB")}{" "}
                          products
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-accent/40 bg-[#f4fbe3] px-4 py-5 sm:px-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                    {data.tools.title}
                  </h2>
                  <p className="mt-1 max-w-xl text-[13px] text-muted">
                    {data.tools.description}
                  </p>
                </div>
                <Link
                  href={data.tools.viewAllHref}
                  className="text-[12px] font-medium text-link hover:underline"
                >
                  View all tools →
                </Link>
              </div>
              <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.tools.items.map((tool) => {
                  const Icon = resolveToolIcon(tool.icon);
                  return (
                    <li key={tool.id} className="min-w-[180px] sm:min-w-0">
                      <Link
                        href={tool.href}
                        className="flex h-full flex-col rounded-md border border-border/70 bg-white/90 px-3 py-3 transition-colors hover:border-accent"
                      >
                        <Icon
                          className="size-5 text-foreground"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                        <p className="mt-2 text-[13px] font-bold text-foreground">
                          {tool.name}
                        </p>
                        <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-snug text-muted">
                          {tool.description}
                        </p>
                        <span className="mt-2 text-[12px] font-medium text-link">
                          Find the right match →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Mobile picks */}
            <div className="lg:hidden">
              <PicksPanel data={data} horizontal />
            </div>

            <section>
              <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                {data.featuredCategories.title}
              </h2>
              <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.featuredCategories.items.map((item) => (
                  <li key={item.id} className="w-[200px] shrink-0 sm:w-[220px]">
                    <Link
                      href={item.href}
                      className="group relative block overflow-hidden rounded-md"
                    >
                      <div className="relative aspect-[16/10] bg-surface-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
                        <img
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                          <p className="text-[13px] font-bold">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-white/75">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                  {data.brands.title}
                </h2>
                <Link
                  href={data.brands.viewAllHref}
                  className="text-[12px] font-medium text-link hover:underline"
                >
                  View all brands →
                </Link>
              </div>
              <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.brands.items.map((brand) => (
                  <li key={brand.id} className="w-[110px] shrink-0 sm:w-auto">
                    <Link
                      href={brand.href}
                      className="flex h-full flex-col items-center rounded-md border border-border bg-white px-2 py-3 text-center transition-colors hover:border-accent"
                    >
                      <div className="flex h-10 w-full items-center justify-center">
                        {brand.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
                          <img
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            className="max-h-8 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[12px] font-bold tracking-wide text-foreground">
                            {brand.name}
                          </span>
                        )}
                      </div>
                      {brand.logo && (
                        <p className="mt-1 text-[11px] font-semibold text-foreground">
                          {brand.name}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted">
                        {brand.productCount} products
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="space-y-4 lg:hidden">
              <LearnPanel data={data} />
              <HelpPanel data={data} />
            </div>
          </div>

          <aside className="hidden min-w-0 space-y-4 lg:block">
            <PicksPanel data={data} />
            <LearnPanel data={data} />
            <HelpPanel data={data} />
          </aside>
        </div>
      </div>

      <section className="border-y border-border bg-[#12161c] py-8 text-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {data.bottomTrust.map((item) => {
            const Icon = TRUST_ICONS[item.icon] ?? BadgeCheck;
            return (
              <div key={item.title} className="flex gap-3">
                <Icon
                  className="mt-0.5 size-5 shrink-0 text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <h3 className="text-[13px] font-bold">{item.title}</h3>
                  <p className="mt-1 text-[12px] leading-snug text-white/55">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PicksPanel({
  data,
  horizontal = false,
}: {
  data: GearHubPageData;
  horizontal?: boolean;
}) {
  if (data.picks.items.length === 0) return null;

  return (
    <section className="rounded-md border border-border bg-white p-4 sm:p-5">
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {data.picks.title}
      </h2>
      <ul
        className={
          horizontal
            ? "mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "mt-3 divide-y divide-border"
        }
      >
        {data.picks.items.map((pick) => (
          <li
            key={pick.id}
            className={horizontal ? "w-[220px] shrink-0" : undefined}
          >
            <Link
              href={pick.href}
              className={
                horizontal
                  ? "flex flex-col rounded-md border border-border p-3"
                  : "flex gap-3 py-3"
              }
            >
              <div
                className={
                  horizontal
                    ? "relative flex aspect-[4/3] items-center justify-center bg-surface-muted/50"
                    : "relative flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-muted/50"
                }
              >
                {pick.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
                  <img
                    src={pick.image.src}
                    alt={pick.image.alt}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-foreground">
                  {pick.brandName} {pick.name}
                </p>
                {(pick.score !== undefined || pick.scoreLabel) && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {pick.score !== undefined && (
                      <span className="inline-flex h-5 min-w-6 items-center justify-center rounded-[3px] bg-score px-1 text-[10px] font-bold text-score-foreground tabular-nums">
                        {pick.score.toFixed(1)}
                      </span>
                    )}
                    {pick.scoreLabel && (
                      <span className="text-[11px] font-medium text-foreground">
                        {pick.scoreLabel}
                      </span>
                    )}
                  </div>
                )}
                <p className="mt-0.5 text-[11px] text-muted">{pick.role}</p>
                <p className="mt-1 text-[12px] font-semibold text-foreground">
                  <CatalogFromPrice
                    slug={pick.href.replace(/^\/products\//, "")}
                    fallback={
                      pick.price
                        ? {
                            amount: pick.price.amount,
                            currency: pick.price.currency,
                          }
                        : null
                    }
                  />
                  {pick.offerCount > 0 ? ` · ${pick.offerCount} offers` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {data.picks.viewAllHref && data.picks.viewAllLabel && (
        <Link
          href={data.picks.viewAllHref}
          className="mt-3 inline-block text-[12px] font-medium text-link hover:underline"
        >
          {data.picks.viewAllLabel}
        </Link>
      )}
    </section>
  );
}

function LearnPanel({ data }: { data: GearHubPageData }) {
  return (
    <section className="rounded-md border border-border bg-white p-4 sm:p-5">
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {data.learn.title}
      </h2>
      <ul className="mt-3 divide-y divide-border">
        {data.learn.items.map((item) => {
          const Icon = LEARN_ICONS[item.icon] ?? BookOpen;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start gap-2.5 py-2.5 hover:text-link"
              >
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-muted"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    {item.description}
                  </span>
                </span>
                <ArrowRight
                  className="mt-1 size-3.5 shrink-0 text-muted"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={data.learn.viewAllHref}
        className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
      >
        View all guides →
      </Link>
    </section>
  );
}

function HelpPanel({ data }: { data: GearHubPageData }) {
  return (
    <section className="rounded-md border border-border bg-[#f7f8f9] p-4 sm:p-5">
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {data.help.title}
      </h2>
      <p className="mt-2 text-[13px] leading-snug text-muted">
        {data.help.description}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href={data.help.primary.href}
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-[12px] font-bold tracking-[0.06em] text-accent-foreground uppercase"
        >
          {data.help.primary.label}
        </Link>
        <Link
          href={data.help.secondary.href}
          className="text-center text-[12px] font-medium text-link hover:underline"
        >
          {data.help.secondary.label} →
        </Link>
      </div>
    </section>
  );
}
