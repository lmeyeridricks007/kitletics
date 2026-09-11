import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { TrustRow } from "@/components/home/TrustRow";
import { BestGuideCard, ReviewCard } from "@/components/cards/ContentCards";
import {
  GuideHubCard,
  GuideHubListCard,
} from "@/components/guides-hub/GuideHubCard";
import { cn } from "@/lib/utils";
import type { GuidesHubPageData } from "@/lib/guides/get-guides-hub-data";

interface GuidesHubPageProps {
  data: GuidesHubPageData;
}

function HubSection({
  id,
  eyebrow,
  title,
  description,
  children,
  muted,
  action,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  muted?: boolean;
  action?: { href: string; label: string };
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-border py-10 sm:py-12",
        muted && "bg-surface-muted/60",
      )}
    >
      <Container size="wide">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent-ink uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {action && (
            <Link href={action.href} className="link-cta shrink-0 text-sm font-semibold">
              {action.label}
            </Link>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}

function GuidesHubHero({ data }: { data: GuidesHubPageData }) {
  const config = data.config;
  const shoesDomain = data.domain === "shoes";
  const eyebrow =
    config?.eyebrow ??
    (shoesDomain
      ? "Shoe guides"
      : data.sport
        ? `${data.sport.name} guides`
        : "Guides");
  const title =
    config?.title ??
    (shoesDomain
      ? "Understand the shoe. Choose with confidence."
      : data.sport
        ? `Understand ${data.sport.name.toLowerCase()} gear. Choose with confidence.`
        : "Understand the gear. Choose with confidence.");
  const deck =
    config?.deck ??
    "Practical buying guides, explainers and comparison advice to help you understand gear before you buy.";
  const cta = config?.primaryCta ??
    (data.featuredGuide
      ? { label: "Start with this guide", href: data.featuredGuide.href }
      : undefined);

  const metrics = [
    data.buyingCount > 0 ? `${data.buyingCount} buying guides` : null,
    data.explainerCount > 0 ? `${data.explainerCount} explainers` : null,
    data.toolCount > 0
      ? `${data.toolCount} decision tool${data.toolCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

  const titleParts = title.includes(". ")
    ? (() => {
        const i = title.indexOf(". ");
        return [title.slice(0, i + 1), title.slice(i + 2)];
      })()
    : [title];

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <Container size="wide" className="relative py-5 sm:py-6 lg:py-7">
        <Breadcrumbs items={data.breadcrumbs} className="mb-4" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,1fr)] lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-col justify-center space-y-3 lg:max-w-xl">
            <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.25rem] leading-[1.05]">
              {titleParts.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">
              {deck}
            </p>

            {metrics.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-subtle">
                {metrics.map((m) => (
                  <li key={m} className="font-medium tabular-nums">
                    {m}
                  </li>
                ))}
              </ul>
            )}

            {cta && (
              <div className="pt-0.5">
                <Link
                  href={cta.href}
                  className="inline-flex items-center rounded-md bg-foreground px-5 py-2.5 text-[13px] font-bold tracking-wide text-white uppercase transition-colors hover:bg-foreground/90"
                >
                  {cta.label}
                </Link>
              </div>
            )}

            {data.allSportsWithGuides.length > 1 && (
              <div className="pt-1">
                <ul className="flex flex-wrap gap-1.5" aria-label="Browse guides by sport">
                  <li>
                    <Link
                      href="/guides"
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                        !data.sport
                          ? "border-foreground bg-foreground text-white"
                          : "border-border bg-white text-muted hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      All sports
                    </Link>
                  </li>
                  {data.allSportsWithGuides.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/guides?sport=${s.slug}`}
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                          data.sport?.id === s.id
                            ? "border-foreground bg-foreground text-white"
                            : "border-border bg-white text-muted hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.featuredGuide ? (
            <GuideHubCard
              card={data.featuredGuide}
              size="featured"
              priority
              eyebrow="Featured guide"
              className="lg:hidden"
            />
          ) : null}
          {data.featuredGuide ? (
            <GuideHubCard
              card={data.featuredGuide}
              size="featured-split"
              priority
              eyebrow="Featured guide"
              className="hidden lg:grid"
            />
          ) : (
            <div className="relative min-h-[200px] overflow-hidden rounded-lg border border-border bg-surface-muted lg:min-h-[240px]">
              <Image
                src="/images/home/guide-running-shoes.jpg"
                alt=""
                fill
                className="object-cover opacity-90"
                sizes="48vw"
                priority
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function GuidesHubPage({ data }: GuidesHubPageProps) {
  const sportSlug = data.sport?.slug;
  const shoesDomain = data.domain === "shoes";
  const bestHref = shoesDomain
    ? "/best?domain=shoes"
    : sportSlug
      ? `/best?sport=${sportSlug}`
      : "/best";
  const reviewsHref = shoesDomain
    ? "/reviews?domain=shoes"
    : sportSlug
      ? `/reviews?sport=${sportSlug}`
      : "/reviews";
  const toolsHref = sportSlug ? `/tools?sport=${sportSlug}` : "/tools";

  return (
    <div
      className="bg-white"
      data-guides-hub={shoesDomain ? "shoes" : (sportSlug ?? "all")}
    >
      <GuidesHubHero data={data} />

      {data.startHereGuides.length > 0 && (
        <HubSection
          id="start-here"
          eyebrow="Start here"
          title="New to this gear? Begin with these."
          description="A short path through the concepts that matter most before you buy."
        >
          <div
            className={cn(
              "grid gap-4",
              data.startHereGuides.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : data.startHereGuides.length === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2",
            )}
          >
            {data.startHereGuides.map((card) => (
              <GuideHubCard key={card.guide.id} card={card} size="start" />
            ))}
          </div>
        </HubSection>
      )}

      {data.topics.map((section, index) => (
        <HubSection
          key={section.topic.id}
          id={`topic-${section.topic.slug}`}
          eyebrow="Guides by topic"
          title={section.topic.label}
          description={section.topic.summary}
          muted={index % 2 === 1}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
            {section.featured && (
              <GuideHubCard card={section.featured} size="topic" />
            )}
            <div className="grid gap-3">
              {section.guides.map((card) => (
                <GuideHubListCard key={card.guide.id} card={card} />
              ))}
            </div>
          </div>
        </HubSection>
      ))}

      {data.buyingGuides.length > 0 && (
        <HubSection
          id="buying"
          eyebrow="Buying guides"
          title="Guides that help you decide what to buy"
          description="Direct purchase advice tied to real products and use cases."
        >
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 snap-x sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {data.buyingGuides.map((card) => (
              <GuideHubCard
                key={card.guide.id}
                card={card}
                size="compact"
                className="w-[280px] shrink-0 snap-start sm:w-auto"
              />
            ))}
          </div>
        </HubSection>
      )}

      {data.explainers.length > 0 && (
        <HubSection
          id="explained"
          eyebrow="Gear explained"
          title="Concepts worth understanding"
          description="Terminology, geometry and tech — so recommendations make sense."
          muted
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.explainers.map((card) => (
              <GuideHubCard key={card.guide.id} card={card} size="compact" />
            ))}
          </div>
        </HubSection>
      )}

      {data.decisionGuides.length > 0 && (
        <HubSection
          id="compare-decide"
          eyebrow="Comparisons"
          title="Decision guides"
          description="Side-by-side choices when two good options look similar."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.decisionGuides.map((card) => (
              <GuideHubCard key={card.guide.id} card={card} size="compact" />
            ))}
          </div>
        </HubSection>
      )}

      {data.relatedBestGuides.length > 0 && (
        <HubSection
          id="best-guides"
          eyebrow="Looking for recommendations?"
          title="Best Guides are different"
          description="Educational Guides explain how gear works. Best Guides shortlist what to buy for a specific use case."
          action={{
            href: bestHref,
            label: shoesDomain
              ? "View best shoe guides →"
              : `View ${data.sport?.name ?? ""} best guides →`
                  .replace(/\s+/g, " ")
                  .trim(),
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.relatedBestGuides.map((guide) => (
              <BestGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </HubSection>
      )}

      {data.config?.finderPanel && (
        <section className="border-b border-border bg-[#0b0f13] py-10 text-white sm:py-12">
          <Container size="wide">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                  Ready to choose?
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {data.config.finderPanel.title}
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
                  {data.config.finderPanel.body}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={data.config.finderPanel.href}
                    className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-bold tracking-wide text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
                  >
                    {data.config.finderPanel.ctaLabel}
                  </Link>
                  {data.compareHref && (
                    <Link
                      href={data.compareHref}
                      className="inline-flex items-center rounded-md border border-white/25 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:border-white/50"
                    >
                      Compare shoes →
                    </Link>
                  )}
                </div>
              </div>
              {data.tools.length > 0 && (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {data.tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition-colors hover:border-accent/50 hover:bg-white/10"
                      >
                        <span className="font-display text-[15px] font-semibold">
                          {tool.name}
                        </span>
                        <span className="text-[12px] font-semibold text-accent">
                          Open →
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={toolsHref}
                      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-white/20 px-4 py-3 text-[13px] text-white/70 transition-colors hover:border-white/40 hover:text-white"
                    >
                      All {data.sport?.name ?? ""} tools
                      <span>→</span>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </Container>
        </section>
      )}

      {data.reviews.length > 0 && (
        <HubSection
          id="reviews"
          eyebrow={shoesDomain ? "Shoe reviews" : `${data.sport?.name ?? ""} reviews`}
          title="Latest product reviews"
          description="Compact evidence from our review library — useful after you’ve narrowed the field."
          action={{
            href: reviewsHref,
            label: shoesDomain
              ? "View all shoe reviews →"
              : `View all ${data.sport?.name ?? ""} reviews →`
                  .replace(/\s+/g, " ")
                  .trim(),
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.reviews.map(({ review, brand, href, product }) => (
              <ReviewCard
                key={review.id}
                title={product?.name ?? review.title}
                review={review}
                href={href}
                brandName={brand?.name}
                product={product}
              />
            ))}
          </div>
        </HubSection>
      )}

      {data.recentlyUpdated.length > 0 && (
        <HubSection
          id="updated"
          eyebrow="Recently updated"
          title="Guides with recent material updates"
          muted
        >
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {data.recentlyUpdated.map((card) => (
              <li key={card.guide.id}>
                <Link
                  href={card.href}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 transition-colors hover:bg-surface-muted/80 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-accent-ink uppercase">
                      {card.typeLabel}
                    </p>
                    <p className="mt-0.5 font-display text-[15px] font-semibold text-foreground">
                      {card.guide.title}
                    </p>
                  </div>
                  <span className="text-[12px] text-subtle tabular-nums">
                    {card.updatedLabel ?? `${card.readingMinutes} min`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </HubSection>
      )}

      <section className="border-b border-border py-10 sm:py-12">
        <Container size="wide">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent-ink uppercase">
              How we write guides
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Methodology, not marketing copy
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Kitletics guides connect to structured product data, use cases and
              evidence. We separate education from recommendations so you can
              learn first — then shortlist with Best Guides and Tools.
            </p>
            <p className="mt-4">
              <Link href="/methodology" className="link-cta text-sm font-semibold">
                Read our methodology →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <TrustRow />
    </div>
  );
}
