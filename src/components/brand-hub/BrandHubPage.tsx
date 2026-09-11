import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Route,
  Watch,
  Dumbbell,
  Flag,
  BadgeCheck,
  Database,
  Tag,
  Sparkles,
  Target,
  ArrowRight,
  Circle,
  Waves,
  Navigation,
  Battery,
  Map,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BrandLocalNav } from "@/components/brand-hub/BrandLocalNav";
import type { BrandHubPageData } from "@/lib/brand-hub/types";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  calendar: Calendar,
  layers: Layers,
  route: Route,
  watch: Watch,
  dumbbell: Dumbbell,
  flag: Flag,
};

const TECH_ICONS: Record<string, LucideIcon> = {
  foam: Waves,
  gel: Circle,
  line: Navigation,
  sole: Layers,
  gps: Watch,
  battery: Battery,
  map: Map,
  rack: Dumbbell,
};

const TRUST_ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  Database,
  Tag,
  Sparkles,
  Target,
};

export function BrandHubPage({ data }: { data: BrandHubPageData }) {
  return (
    <div className="overflow-x-hidden bg-white" data-brand-hub={data.brand.slug}>
      <BrandHero data={data} />
      <BrandLocalNav items={data.localNav} />
      <BrandBody data={data} />
      <BrandTrustRow items={data.trust} />
    </div>
  );
}

function BrandHero({ data }: { data: BrandHubPageData }) {
  const { brand, breadcrumbs, pillars, heroProduct, overview } = data;

  return (
    <section className="border-b border-border bg-[#f7f8f9]">
      <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)_minmax(240px,0.72fr)] lg:items-stretch lg:gap-5 lg:px-8 lg:py-7">
        <div className="flex flex-col justify-center">
          <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, i) => (
                <li
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {i > 0 && <span aria-hidden>›</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/80">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p className="mt-4 text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            Brand hub
          </p>

          <div className="mt-3">
            {brand.logoSrc ? (
              <Image
                src={brand.logoSrc}
                alt={brand.name}
                width={220}
                height={48}
                sizes="220px"
                quality={IMAGE_QUALITY.card}
                priority
                className="h-10 w-auto max-w-[220px] object-contain object-left sm:h-12"
              />
            ) : (
              <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-foreground">
                {brand.name}
              </h1>
            )}
            {brand.logoSrc && <h1 className="sr-only">{brand.name}</h1>}
          </div>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            {brand.summary}
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-3">
            {pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon] ?? Layers;
              return (
                <li key={pillar.id} className="flex gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-white">
                    <Icon
                      className="size-4 text-accent"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">
                      {pillar.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">
                      {pillar.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-md bg-white sm:min-h-[280px] lg:min-h-full lg:rounded-lg">
          {heroProduct?.image ? (
            <Image
              src={heroProduct.image.src}
              alt={heroProduct.image.alt}
              width={480}
              height={360}
              sizes={IMAGE_SIZES.brandHero}
              quality={IMAGE_QUALITY.hero}
              priority
              className="max-h-[320px] w-auto max-w-[90%] object-contain p-6"
            />
          ) : (
            <p className="px-6 text-center text-sm text-muted">
              {brand.name} products on Kitletics
            </p>
          )}
        </div>

        <aside className="flex flex-col justify-center rounded-lg bg-[#12161c] px-5 py-6 text-white sm:px-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            Brand overview
          </p>
          <dl className="mt-5 space-y-3.5">
            {overview.metrics.map((m) => (
              <div key={m.id}>
                <dt className="text-[11px] tracking-[0.06em] text-white/45 uppercase">
                  {m.label}
                </dt>
                <dd className="mt-0.5 font-display text-2xl font-bold text-accent tabular-nums">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] leading-snug text-white/70">
            {overview.blurb}
          </p>
          <Link
            href={overview.ctaHref}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-white/25 px-4 text-[12px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:border-accent hover:text-accent"
          >
            {overview.ctaLabel} →
          </Link>
        </aside>
      </div>
    </section>
  );
}

function BrandBody({ data }: { data: BrandHubPageData }) {
  return (
    <div className="bg-[#f7f8f9]">
      <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] lg:gap-x-7 lg:gap-y-5 lg:px-8 lg:py-8">
        <div className="min-w-0 space-y-8">
          <section
            id="overview"
            className="scroll-mt-16 rounded-md border border-border bg-white p-5 sm:p-6"
          >
            <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
              {data.about.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
              {data.about.body}
            </p>
            {data.about.howLinesDiffer && (
              <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-3">
                <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                  How lines differ
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-foreground">
                  {data.about.howLinesDiffer}
                </p>
              </div>
            )}
            {data.about.generationContext && (
              <p className="mt-3 text-[13px] leading-snug text-muted">
                <span className="font-semibold text-foreground">
                  Generation context:{" "}
                </span>
                {data.about.generationContext}
              </p>
            )}
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.about.metrics.map((m) => (
                <li key={m.id}>
                  <p className="font-display text-2xl font-bold text-accent tabular-nums sm:text-3xl">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[12px] text-muted">{m.label}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="lg:hidden space-y-4">
            <CategoriesRail data={data} />
            <KnownForRail data={data} />
          </div>

          {data.products.items.length > 0 && (
            <section className="scroll-mt-16">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                  {data.products.title}
                </h2>
                <Link
                  href={data.products.href}
                  className="shrink-0 text-[12px] font-medium text-link hover:underline"
                >
                  View all {data.brand.name} products →
                </Link>
              </div>
              {data.products.fitChips && data.products.fitChips.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                    Shop by sizing (where catalogued)
                  </p>
                  <div
                    className="mt-2.5 flex flex-wrap gap-2"
                    role="group"
                    aria-label="Fit and sizing"
                  >
                    {data.products.fitChips.map((chip) => (
                      <Link
                        key={chip.href}
                        href={chip.href}
                        className="inline-flex items-center border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground"
                      >
                        <span className="uppercase tracking-[0.04em]">
                          {chip.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.products.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {data.families.items.length > 0 && (
            <section id="families" className="scroll-mt-16">
              <h2 className="mb-4 text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                {data.families.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.families.items.map((fam) => (
                  <li key={fam.id}>
                    <Link
                      href={fam.href}
                      className="flex h-full gap-3 rounded-md border border-border bg-white p-3 transition-colors hover:border-accent"
                    >
                      <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted/50">
                        {fam.image && (
                          <Image
                            src={fam.image.src}
                            alt=""
                            fill
                            sizes="64px"
                            quality={IMAGE_QUALITY.thumb}
                            loading="lazy"
                            className="object-contain p-1"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-foreground">
                          {fam.name}
                        </span>
                        {fam.generationLabel && (
                          <span className="mt-0.5 block text-[11px] font-medium text-accent">
                            {fam.generationLabel}
                          </span>
                        )}
                        <span className="mt-0.5 line-clamp-3 block text-[12px] text-muted">
                          {fam.description}
                        </span>
                        {fam.whoSuits && (
                          <span className="mt-1 line-clamp-2 block text-[11px] text-subtle">
                            Who it suits: {fam.whoSuits}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.technologies.items.length > 0 && (
            <section id="technology" className="scroll-mt-16">
              <h2 className="mb-4 text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                {data.technologies.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.technologies.items.map((tech) => {
                  const Icon = TECH_ICONS[tech.icon] ?? Layers;
                  const inner = (
                    <>
                      <Icon
                        className="size-5 text-accent"
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <h3 className="mt-3 text-[14px] font-bold text-foreground">
                        {tech.name}
                      </h3>
                      <p className="mt-1.5 flex-1 text-[12px] leading-snug text-muted">
                        {tech.description}
                      </p>
                      {tech.href && (
                        <span className="mt-3 text-[12px] font-medium text-link">
                          Learn more →
                        </span>
                      )}
                    </>
                  );
                  return (
                    <li key={tech.id}>
                      {tech.href ? (
                        <Link
                          href={tech.href}
                          className="flex h-full flex-col rounded-md border border-border bg-white p-4 transition-colors hover:border-accent"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex h-full flex-col rounded-md border border-border bg-white p-4">
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="lg:hidden space-y-4">
            <GuidesRail data={data} />
            <OfficialSiteRail data={data} />
          </div>

          {data.reviews.items.length > 0 && (
            <section id="reviews" className="scroll-mt-16">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                  {data.reviews.title}
                </h2>
                <Link
                  href={data.reviews.href}
                  className="text-[12px] font-medium text-link hover:underline"
                >
                  View all reviews →
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.reviews.items.map((review) => (
                  <li key={review.id}>
                    <Link
                      href={review.href}
                      className="block h-full rounded-md border border-border bg-white p-4 transition-colors hover:border-accent"
                    >
                      <div className="flex items-center gap-2">
                        {review.score !== undefined && (
                          <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-[4px] bg-score px-1 text-[11px] font-bold text-score-foreground tabular-nums">
                            {review.score.toFixed(1)}
                          </span>
                        )}
                        {review.scoreLabel && (
                          <span className="text-[12px] font-medium text-foreground">
                            {review.scoreLabel}
                          </span>
                        )}
                        {review.dateLabel && (
                          <span className="ml-auto text-[11px] text-muted">
                            {review.dateLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[14px] font-bold text-foreground">
                        {review.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {review.productName}
                      </p>
                      <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-muted">
                        {review.verdict}
                      </p>
                      <span className="mt-3 inline-block text-[12px] font-medium text-link">
                        Read review →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.comparisons.items.length > 0 && (
            <section id="comparisons" className="scroll-mt-16">
              <h2 className="mb-4 text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                {data.comparisons.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.comparisons.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="block h-full rounded-md border border-border bg-white p-4 transition-colors hover:border-accent"
                    >
                      {item.meta && (
                        <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
                          {item.meta}
                        </p>
                      )}
                      <p className="mt-1 text-[14px] font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[13px] text-muted">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-block text-[12px] font-medium text-link">
                        Open comparison →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.bestAppearances.items.length > 0 && (
            <section id="best-appearances" className="scroll-mt-16">
              <h2 className="mb-4 text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
                {data.bestAppearances.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.bestAppearances.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="block h-full rounded-md border border-border bg-white p-4 transition-colors hover:border-accent"
                    >
                      {item.meta && (
                        <p className="text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
                          {item.meta}
                        </p>
                      )}
                      <p className="mt-1 text-[14px] font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[13px] text-muted">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-block text-[12px] font-medium text-link">
                        View Best guide →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <CategoriesRail data={data} />
          <KnownForRail data={data} />
          <GuidesRail data={data} />
          <OfficialSiteRail data={data} />
        </aside>
      </div>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: BrandHubPageData["products"]["items"][number];
}) {
  return (
    <article className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-white lg:w-auto">
      <Link
        href={product.href}
        className="relative flex aspect-[4/3] items-center justify-center bg-surface-muted/40 px-2"
      >
        {product.image && (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes={IMAGE_SIZES.brandCard}
            quality={IMAGE_QUALITY.card}
            loading="lazy"
            className="object-contain p-2"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-2.5 pb-3">
        <p className="text-[12px] leading-snug">
          <span className="font-bold text-foreground">{product.brandName}</span>{" "}
          <Link href={product.href} className="text-foreground hover:text-link">
            {product.name}
          </Link>
        </p>
        {(product.score !== undefined || product.scoreLabel) && (
          <div className="flex items-center gap-1.5">
            {product.score !== undefined && (
              <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-[4px] bg-score px-1 text-[11px] font-bold text-score-foreground tabular-nums">
                {product.score.toFixed(1)}
              </span>
            )}
            {product.scoreLabel && (
              <span className="text-[11px] font-medium text-foreground">
                {product.scoreLabel}
              </span>
            )}
          </div>
        )}
        <p className="text-[11px] text-muted">{product.role}</p>
        {product.price ? (
          <p className="text-[12px] font-semibold text-foreground">
            From{" "}
            {formatPrice(product.price.amount, product.price.currency, "nl-NL")}
            {product.offerCount > 0 ? ` · ${product.offerCount} offers` : ""}
          </p>
        ) : (
          <p className="text-[12px] text-muted">
            Check prices
            {product.offerCount > 0 ? ` · ${product.offerCount} offers` : ""}
          </p>
        )}
        <Link
          href={product.href}
          className="mt-auto pt-0.5 text-[12px] font-medium text-link hover:underline"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}

function RailCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-white p-4 sm:p-5">
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
    </section>
  );
}

function CategoriesRail({ data }: { data: BrandHubPageData }) {
  if (data.categories.items.length === 0) return null;
  return (
    <RailCard
      title={data.categories.title}
      footer={
        data.categories.href ? (
          <Link
            href={data.categories.href}
            className="text-[12px] font-medium text-link hover:underline"
          >
            See all {data.brand.name} categories →
          </Link>
        ) : undefined
      }
    >
      <ul className="divide-y divide-border">
        {data.categories.items.map((cat) => (
          <li key={cat.id}>
            <Link
              href={cat.href}
              className="flex items-center gap-3 py-2.5 hover:text-link"
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted/50">
                {cat.image ? (
                  <Image
                    src={cat.image.src}
                    alt=""
                    fill
                    sizes="40px"
                    quality={IMAGE_QUALITY.thumb}
                    loading="lazy"
                    className="object-contain p-0.5"
                  />
                ) : (
                  <Layers className="size-4 text-muted" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-foreground">
                  {cat.name}
                </span>
                <span className="text-[11px] text-muted">
                  {cat.count} products
                </span>
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function KnownForRail({ data }: { data: BrandHubPageData }) {
  if (data.knownFor.items.length === 0) return null;
  return (
    <RailCard title={data.knownFor.title}>
      <ul className="space-y-2.5">
        {data.knownFor.items.map((item) => (
          <li
            key={item.id}
            className="flex gap-2 text-[13px] leading-snug text-foreground"
          >
            <BadgeCheck
              className="mt-0.5 size-4 shrink-0 text-accent"
              strokeWidth={1.75}
              aria-hidden
            />
            {item.label}
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function GuidesRail({ data }: { data: BrandHubPageData }) {
  if (data.guides.items.length === 0) return null;
  return (
    <div id="guides" className="scroll-mt-16">
    <RailCard
      title={data.guides.title}
      footer={
        <Link
          href={data.guides.href}
          className="text-[12px] font-medium text-link hover:underline"
        >
          View all guides →
        </Link>
      }
    >
      <ul className="space-y-3">
        {data.guides.items.map((g) => (
          <li key={g.id}>
            <Link href={g.href} className="group flex gap-3">
              <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                <Image
                  src={g.imageSrc}
                  alt=""
                  fill
                  sizes="80px"
                  quality={IMAGE_QUALITY.thumb}
                  loading="lazy"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-foreground group-hover:text-link">
                  {g.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] text-muted">
                  {g.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </RailCard>
    </div>
  );
}

function OfficialSiteRail({ data }: { data: BrandHubPageData }) {
  if (!data.officialSite) return null;
  return (
    <section className="rounded-md border border-border bg-white p-4 sm:p-5">
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {data.officialSite.title}
      </h2>
      {data.brand.logoSrc && (
        <Image
          src={data.brand.logoSrc}
          alt=""
          width={140}
          height={28}
          sizes="140px"
          quality={IMAGE_QUALITY.thumb}
          loading="lazy"
          className="mt-3 h-7 w-auto object-contain object-left"
        />
      )}
      <p className="mt-3 text-[12px] leading-snug text-muted">
        {data.officialSite.description}
      </p>
      <a
        href={data.officialSite.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-[#12161c] px-3 text-[12px] font-bold tracking-[0.06em] text-white uppercase hover:bg-black"
      >
        {data.officialSite.ctaLabel}
      </a>
    </section>
  );
}

function BrandTrustRow({
  items,
}: {
  items: BrandHubPageData["trust"];
}) {
  return (
    <section className="border-y border-border bg-[#12161c] py-8 text-white">
      <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        {items.map((item) => {
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
  );
}
