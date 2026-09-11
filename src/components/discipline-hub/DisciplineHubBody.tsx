import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Database,
  RefreshCw,
  Sparkles,
  Target,
  Road,
  LineChart,
  ShoppingBag,
  Flag,
  Mountain,
  Footprints,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { resolveToolIcon } from "@/lib/tools/icons";
import { SportHubFooter } from "@/components/sport-hub/SportHubFooter";
import type { DisciplineHubPageData } from "@/lib/discipline-hub/types";

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  surface: Road,
  progress: LineChart,
  gear: ShoppingBag,
  race: Flag,
  terrain: Mountain,
  grip: Footprints,
};

const TRUST_ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  RefreshCw,
  Database,
  Sparkles,
  Target,
};

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
        {title}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="shrink-0 text-[12px] font-medium text-link hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function RailCard({
  id,
  title,
  children,
  footer,
  className = "",
}: {
  id?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 rounded-md border border-border bg-white p-4 sm:p-5 ${className}`}
    >
      <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
    </section>
  );
}

export function DisciplineHubBody({ data }: { data: DisciplineHubPageData }) {
  return (
    <>
      <div className="bg-[#f7f8f9]">
        {/*
          Single DOM tree: main sections + rail cards.
          On lg, CSS grid places rail cards in column 2.
        */}
        <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] lg:gap-x-7 lg:gap-y-5 lg:px-8 lg:py-8">
          <section id="overview" className="scroll-mt-16 lg:col-start-1">
            <SectionHeading title={data.why.title} />
            <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
              {data.why.intro}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.why.benefits.map((b) => {
                const Icon = BENEFIT_ICONS[b.icon] ?? Target;
                return (
                  <li
                    key={b.id}
                    className="rounded-md border border-border bg-white p-4"
                  >
                    <Icon
                      className="size-4 text-accent"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <h3 className="mt-2.5 text-[14px] font-bold text-foreground">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-snug text-muted">
                      {b.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <RailCard
            title={data.goals.title}
            className="lg:col-start-2 lg:row-start-1"
            footer={
              data.goals.seeAllHref ? (
                <Link
                  href={data.goals.seeAllHref}
                  className="text-[12px] font-medium text-link hover:underline"
                >
                  Explore gear for these goals →
                </Link>
              ) : undefined
            }
          >
            <ul className="divide-y divide-border">
              {data.goals.items.map((goal) => (
                <li key={goal.id}>
                  <Link
                    href={goal.href}
                    className="flex items-center justify-between gap-2 py-2.5 text-[13px] font-medium text-foreground hover:text-link"
                  >
                    <span>{goal.label}</span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          <section id="tools" className="scroll-mt-16 lg:col-start-1">
            <SectionHeading title={data.tools.title} />
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.tools.items.map((tool) => {
                const Icon = resolveToolIcon(tool.icon);
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="flex w-[200px] shrink-0 flex-col rounded-md border border-border bg-white p-4 transition-colors hover:border-accent sm:w-auto"
                  >
                    <Icon
                      className="size-7 text-accent"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="mt-3 text-[14px] font-bold text-foreground">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-snug text-muted">
                      {tool.description}
                    </p>
                    <span className="mt-3 text-[12px] font-medium text-link">
                      Open tool →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <RailCard
            title={data.atAGlance.title}
            className="lg:col-start-2"
          >
            <dl className="space-y-3">
              {data.atAGlance.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="text-[12px] text-muted">{m.label}</dt>
                  <dd className="text-right text-[12px] font-semibold text-foreground">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </RailCard>

          {data.products && (
            <section id="gear" className="scroll-mt-16 lg:col-start-1">
              <SectionHeading
                title={data.products.title}
                href={data.products.href}
                linkLabel={data.products.viewAllLabel}
              />
              <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.products.items.map((product) => (
                  <article
                    key={product.id}
                    className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-white lg:w-auto"
                  >
                    <Link
                      href={product.href}
                      className="relative flex aspect-[4/3] items-center justify-center bg-surface-muted/40 px-2"
                    >
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
                        <img
                          src={product.image.src}
                          alt={product.image.alt}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      ) : (
                        <ProductImageFallback label={product.name} />
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col gap-1.5 px-3 pt-2.5 pb-3">
                      <p className="text-[12px] leading-snug">
                        <span className="font-bold text-foreground">
                          {product.brandName}
                        </span>{" "}
                        <Link
                          href={product.href}
                          className="text-foreground hover:text-link"
                        >
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
                          {formatPrice(
                            product.price.amount,
                            product.price.currency,
                            "nl-NL",
                          )}
                          {product.offerCount > 0
                            ? ` · ${product.offerCount} offers`
                            : ""}
                        </p>
                      ) : (
                        <p className="text-[12px] text-muted">
                          Check prices
                          {product.offerCount > 0
                            ? ` · ${product.offerCount} offers`
                            : ""}
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
                ))}
              </div>
            </section>
          )}

          <RailCard
            id="races"
            title={data.raceDay.title}
            className="lg:col-start-2"
          >
            <ul className="space-y-3">
              {data.raceDay.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="group block">
                    <p className="text-[13px] font-bold text-foreground group-hover:text-link">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          <section id="guides" className="scroll-mt-16 lg:col-start-1">
            <SectionHeading
              title={data.guides.title}
              href={data.guides.href}
              linkLabel="View all guides →"
            />
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.guides.items.map((guide) => (
                <Link
                  key={guide.id}
                  href={guide.href}
                  className="flex w-[200px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-white sm:w-auto"
                >
                  <div className="relative aspect-[16/10] bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
                    <img
                      src={guide.imageSrc}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="text-[13px] leading-snug font-bold text-foreground">
                      {guide.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-muted">
                      {guide.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <RailCard
            id="related"
            title={data.related.title}
            className="lg:col-start-2"
          >
            <ul className="divide-y divide-border">
              {data.related.items.map((d) => (
                <li key={d.id}>
                  <Link
                    href={d.href}
                    className="flex items-center justify-between gap-2 py-2.5 text-[13px] font-medium text-foreground hover:text-link"
                  >
                    <span>{d.label}</span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          <section
            id="training"
            className="scroll-mt-16 rounded-md border border-border bg-white p-5 lg:col-start-1"
          >
            <h2 className="text-[13px] font-bold tracking-[0.08em] text-foreground uppercase">
              Training & pacing tools
            </h2>
            <p className="mt-2 max-w-xl text-[13px] text-muted">
              Use Kitletics tools for pace math and race-time estimates — not
              generic coaching plans.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {data.tools.items
                .filter((t) =>
                  ["running-pace-calculator", "race-time-predictor"].includes(
                    t.slug,
                  ),
                )
                .map((t) => (
                  <li key={t.id}>
                    <Link
                      href={t.href}
                      className="text-[13px] font-medium text-link hover:underline"
                    >
                      {t.name} →
                    </Link>
                  </li>
                ))}
              {data.guides.items.slice(0, 2).map((g) => (
                <li key={g.id}>
                  <Link
                    href={g.href}
                    className="text-[13px] font-medium text-link hover:underline"
                  >
                    {g.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="border-y border-border bg-[#12161c] py-8 text-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {data.trust.map((item) => {
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

      <SportHubFooter footer={data.footer} />
    </>
  );
}
