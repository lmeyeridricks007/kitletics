import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { GuideNeedsSection } from "@/components/guides/GuideNeedsSection";
import { GuideAnatomySection } from "@/components/guides/GuideAnatomySection";
import { GuideFactorsSection } from "@/components/guides/GuideFactorsSection";
import { GuideFitSection } from "@/components/guides/GuideFitSection";
import { GuideProductRail } from "@/components/guides/GuideProductRail";
import { GuideExplainerBlocks } from "@/components/guides/GuideExplainerBlocks";
import { GuideApproachStrip } from "@/components/guides/GuideApproachStrip";
import {
  ConceptDiagram,
  LookForPanels,
} from "@/components/guides/GuideConceptVisuals";
import {
  GuideNumberedHeading,
  GuideSection,
} from "@/components/guides/GuidePrimitives";
import { AuthorCard } from "@/components/review/AuthorCard";
import { TrustRow } from "@/components/home/TrustRow";
import {
  JsonLdScript,
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import type { LongFormGuidePageData } from "@/lib/guides/get-long-form-guide-page-data";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { GuideRelatedComparisons } from "@/components/best/BestGuideRelatedComparisons";

export function LongFormGuidePage({ data }: { data: LongFormGuidePageData }) {
  const { guide, config, author, faqs, tools } = data;

  if (!config) {
    return <SimpleGuideFallback data={data} />;
  }

  if (config.layout === "explainer" && config.explainer) {
    return <ExplainerGuideLayout data={data} />;
  }

  return (
    <>
      <JsonLd data={data} />
      <div id="top" />

      <div className="relative border-b border-border bg-white">
        <div className="relative mx-auto grid max-w-[var(--container)] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:gap-12 lg:px-8 lg:py-10">
          <div className="min-w-0">
            <Breadcrumbs items={data.breadcrumbs} className="mb-5" />
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              {config.eyebrow}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.35rem] leading-[1.12]">
              {config.displayTitle ?? guide.title}
            </h1>
            {config.deck && (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                {config.deck}
              </p>
            )}
            <MetaRow data={data} />
            {config.heroImageSrc && (
              <div className="relative mt-6 aspect-[16/9] w-full max-w-2xl overflow-hidden bg-surface-muted">
                <Image
                  src={config.heroImageSrc}
                  alt={config.heroImageAlt}
                  fill
                  className="object-cover object-[center_45%]"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                />
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <GuideSidebar data={data} variant="hero" />
            </div>

            <article className="mt-8 space-y-14 border-t border-border pt-8">
              <GuideNeedsSection
                number={1}
                needs={config.needs}
                tip={config.needsTip}
              />

              {config.anatomy && (
                <GuideAnatomySection
                  number={2}
                  title={config.anatomy.title}
                  imageSrc={config.anatomy.imageSrc}
                  imageAlt={config.anatomy.imageAlt}
                  annotations={config.anatomy.annotations}
                />
              )}

              <GuideFactorsSection
                number={3}
                factors={config.factors}
                productMedia={data.factorProductMedia}
              />

              {config.factors.length > 0 && (
                <GuideSection id="look-for-factors">
                  <GuideNumberedHeading
                    number={4}
                    title="What to look for while comparing"
                  />
                  <p className="mt-3 max-w-2xl text-[15px] text-muted">
                    Turn each factor into checks you can verify on a product page,
                    in a shop, or on a short test run.
                  </p>
                  <LookForPanels
                    panels={config.factors.slice(0, 4).map((f) => ({
                      id: f.id,
                      title: f.label,
                      checks: f.bullets.slice(0, 3),
                    }))}
                  />
                </GuideSection>
              )}

              <GuideFitSection
                number={5}
                cards={config.fit}
                tip={config.fitTip}
              />

              <GuideSection id="terrain">
                <GuideNumberedHeading number={6} title="Terrain & conditions" />
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {guide.sections.find((s) => s.id === "s-start")?.body ??
                    "Road, trail and mixed surfaces pull different outsole, protection and geometry priorities."}
                </p>
                <ConceptDiagram
                  variant="road-vs-trail"
                  caption="Road and trail shoes differ in outsole, protection and geometry — compare the job, not just cushion branding."
                />
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      t: "Road",
                      d: "Smooth outsoles and road-oriented foam for pavement and paths.",
                    },
                    {
                      t: "Trail",
                      d: "Lugs, rock protection and grip for off-road surfaces.",
                    },
                    {
                      t: "Road-to-trail",
                      d: "Compromise tools for light trails and mixed surfaces.",
                    },
                    {
                      t: "Treadmill / wet",
                      d: "Consider breathability, rubber and traction for indoor or wet conditions.",
                    },
                  ].map((row) => (
                    <li
                      key={row.t}
                      className="border border-border bg-white px-4 py-3"
                    >
                      <p className="text-[14px] font-bold">{row.t}</p>
                      <p className="mt-1 text-[13px] text-muted">{row.d}</p>
                    </li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection id="budget">
                <GuideNumberedHeading
                  number={7}
                  title="How much should you spend?"
                />
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {guide.sections.find((s) => s.id === "s-budget")?.body ??
                    "Higher price often reflects materials and positioning — not automatically a better personal match."}
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      t: "Value",
                      d: "Solid daily trainers that cover most easy mileage.",
                    },
                    {
                      t: "Mid-range",
                      d: "Current foams and features for regular training.",
                    },
                    {
                      t: "Premium / race",
                      d: "Specialised tools — worth it when the session demands them.",
                    },
                  ].map((row) => (
                    <li
                      key={row.t}
                      className="border border-border bg-white px-4 py-3"
                    >
                      <p className="text-[14px] font-bold">{row.t}</p>
                      <p className="mt-1 text-[13px] text-muted">{row.d}</p>
                    </li>
                  ))}
                </ul>
              </GuideSection>

              <GuideSection id="mistakes">
                <GuideNumberedHeading
                  number={8}
                  title="Common mistakes to avoid"
                />
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Choosing solely by the highest Kitletics Score — score is category assessment, not your personal match.",
                    "Buying a race shoe for every easy run.",
                    "Assuming more cushioning is always better.",
                    "Ignoring width and lockdown.",
                    "Choosing purely by discount without checking fit and role.",
                    guide.sections.find((s) => s.id === "s-mistakes")?.body,
                  ]
                    .filter(Boolean)
                    .map((line) => (
                      <li
                        key={String(line).slice(0, 48)}
                        className="border-l-2 border-accent pl-4 text-[14px] leading-relaxed text-muted"
                      >
                        {line}
                      </li>
                    ))}
                </ul>
                {tools[0] && (
                  <p className="mt-4 text-[14px] text-muted">
                    For a personal shortlist, use the{" "}
                    <Link
                      href={`/tools/${tools[0].slug}`}
                      className="font-medium text-link hover:underline"
                    >
                      Running Shoe Finder
                    </Link>
                    .
                  </p>
                )}
              </GuideSection>

              {faqs.length > 0 && (
                <GuideSection id="faq">
                  <GuideNumberedHeading number={9} title="FAQ" />
                  <dl className="mt-5 space-y-5">
                    {faqs.map((faq) => (
                      <div key={faq.id}>
                        <dt className="text-[15px] font-bold text-foreground">
                          {faq.question}
                        </dt>
                        <dd className="mt-1.5 text-[14px] leading-relaxed text-muted">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </GuideSection>
              )}

              <GuideProductRail
                title={config.productRailTitle}
                browseHref={config.productRailBrowseHref}
                browseLabel={config.productRailBrowseLabel}
                products={data.productExamples}
              />

              <GuideRelatedComparisons
                comparisons={data.relatedComparisons}
                title="Head-to-head comparisons"
              />

              {author && (
                <div className="border-t border-border pt-8 pb-4">
                  <AuthorCard author={author} />
                </div>
              )}
            </article>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pb-10">
            <GuideSidebar data={data} variant="full" />
          </aside>
        </div>
      </div>

      <div className="border-t border-border lg:hidden">
        <div className="mx-auto max-w-[var(--container)] px-4 py-8 sm:px-6">
          <GuideSidebar data={data} variant="full" omitFinder omitToc />
        </div>
      </div>

      <TrustRow />
    </>
  );
}

function ExplainerGuideLayout({ data }: { data: LongFormGuidePageData }) {
  const { guide, config, author, faqs } = data;
  if (!config?.explainer) return null;

  const heroIsProduct =
    Boolean(config.heroImageSrc) &&
    !config.heroImageSrc.includes("/fallbacks/") &&
    !config.heroImageSrc.endsWith(".svg") &&
    !config.heroImageSrc.includes("/brands/heroes/");

  return (
    <>
      <JsonLd data={data} />
      <div id="top" />

      <div className="relative border-b border-border bg-white">
        {config.heroImageSrc && heroIsProduct && (
          <div
            className="pointer-events-none absolute inset-y-0 left-[42%] right-[8%] hidden max-h-[460px] xl:block"
            aria-hidden
          >
            <Image
              src={config.heroImageSrc}
              alt=""
              fill
              className="object-contain object-center p-6 opacity-90"
              sizes="45vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
          </div>
        )}
        {config.heroImageSrc && !heroIsProduct && (
          <div
            className="pointer-events-none absolute inset-y-0 left-[18%] right-[32%] hidden max-h-[440px] opacity-45 xl:block"
            aria-hidden
          >
            <Image
              src={config.heroImageSrc}
              alt=""
              fill
              className="object-contain object-center p-8"
              sizes="42vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white" />
          </div>
        )}

        <div className="relative mx-auto grid max-w-[var(--container)] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,340px)] lg:gap-12 lg:px-8 lg:py-10">
          <div className="min-w-0">
            <Breadcrumbs items={data.breadcrumbs} className="mb-5" />
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              {config.eyebrow}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.35rem] leading-[1.12]">
              {config.displayTitle ?? guide.title}
            </h1>
            {config.deck && (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                {config.deck}
              </p>
            )}
            <MetaRow data={data} />
            {config.heroImageSrc && (
              <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden bg-surface-muted/30 xl:hidden">
                <Image
                  src={config.heroImageSrc}
                  alt={config.heroImageAlt}
                  fill
                  className="object-contain p-6"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <GuideSidebar data={data} variant="hero" />
            </div>

            <article className="mt-12">
              <GuideExplainerBlocks
                data={data}
                explainer={config.explainer}
              />

              {faqs.length > 0 && (
                <GuideSection id="faq" className="mt-14">
                  <GuideNumberedHeading
                    number={
                      config.explainer.blocks.filter(
                        (b) => b.type !== "callout" && b.type !== "cta",
                      ).length + 1
                    }
                    title="Frequently asked questions"
                  />
                  <dl className="mt-5 space-y-5">
                    {faqs.map((faq) => (
                      <div key={faq.id}>
                        <dt className="text-[15px] font-bold text-foreground">
                          {faq.question}
                        </dt>
                        <dd className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-muted">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </GuideSection>
              )}

              <div className="mt-14">
                <GuideProductRail
                  title={config.productRailTitle ?? "Compare approaches"}
                  browseHref={config.productRailBrowseHref}
                  browseLabel={config.productRailBrowseLabel}
                  products={data.productExamples}
                />
              </div>

              <GuideRelatedComparisons
                comparisons={data.relatedComparisons}
                title="Head-to-head comparisons"
              />

              <GuideSection id="methodology" className="mt-14">
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  How we research
                </h2>
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
                  {config.explainer.methodologyNote ??
                    "Kitletics guides combine manufacturer specifications, catalog taxonomy and independent specialist coverage. Product examples use live catalog data."}
                </p>
                <p className="mt-3 text-[13px] text-subtle">
                  <Link href="/methodology" className="text-link hover:underline">
                    Full methodology →
                  </Link>
                </p>
              </GuideSection>

              {author && (
                <div className="mt-12 border-t border-border pt-8 pb-4">
                  <AuthorCard author={author} />
                </div>
              )}
            </article>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pb-10">
            <GuideSidebar data={data} variant="full" />
          </aside>
        </div>
      </div>

      <div className="border-t border-border lg:hidden">
        <div className="mx-auto max-w-[var(--container)] px-4 py-8 sm:px-6">
          <GuideSidebar data={data} variant="full" omitFinder omitToc />
        </div>
      </div>

      <TrustRow />
    </>
  );
}

function MetaRow({ data }: { data: LongFormGuidePageData }) {
  const { author, readingMinutes, lastUpdatedLabel, nextReviewLabel } = data;
  return (
    <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
      <li className="flex items-start gap-2 text-[12px] text-muted">
        <BadgeCheck
          className="mt-0.5 size-4 shrink-0 text-foreground"
          aria-hidden
        />
        <span>
          <span className="font-semibold text-foreground">Expert Guide</span>
          <span className="block">
            {author
              ? `By ${author.name}`
              : "Researched & written by Kitletics specialists."}
          </span>
        </span>
      </li>
      {lastUpdatedLabel && (
        <li className="flex items-start gap-2 text-[12px] text-muted">
          <RefreshCw
            className="mt-0.5 size-4 shrink-0 text-foreground"
            aria-hidden
          />
          <span>
            <span className="font-semibold text-foreground">Updated</span>
            <span className="block">{lastUpdatedLabel}</span>
          </span>
        </li>
      )}
      {nextReviewLabel && (
        <li className="flex items-start gap-2 text-[12px] text-muted">
          <BookOpen
            className="mt-0.5 size-4 shrink-0 text-foreground"
            aria-hidden
          />
          <span>
            <span className="font-semibold text-foreground">Next review</span>
            <span className="block">{nextReviewLabel}</span>
          </span>
        </li>
      )}
      <li className="flex items-start gap-2 text-[12px] text-muted">
        <Clock
          className="mt-0.5 size-4 shrink-0 text-foreground"
          aria-hidden
        />
        <span>
          <span className="font-semibold text-foreground">Reading time</span>
          <span className="block">{readingMinutes} min read</span>
        </span>
      </li>
    </ul>
  );
}

function JsonLd({ data }: { data: LongFormGuidePageData }) {
  const { guide, author, faqs } = data;
  return (
    <JsonLdScript
      data={[
        breadcrumbJsonLd(data.breadcrumbs),
        articleJsonLd({
          title: guide.title,
          description:
            guide.shortDescription ??
            guide.quickAnswer ??
            guide.sections[0]?.body ??
            guide.title,
          url: `/guides/${guide.slug}`,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          authorName: author?.name,
        }),
        faqPageJsonLd(faqs),
      ]}
    />
  );
}

function SimpleGuideFallback({ data }: { data: LongFormGuidePageData }) {
  const { guide, author, faqs, tools } = data;
  const hero = resolveGuideImage(guide);
  const showHero =
    Boolean(hero.src) &&
    !hero.src.includes("/fallbacks/") &&
    !hero.src.endsWith(".svg");

  return (
    <>
      <JsonLd data={data} />
      <div id="top" />
      <section className="relative border-b border-border bg-white">
        {showHero && (
          <div
            className="pointer-events-none absolute inset-y-0 left-[40%] right-[6%] hidden max-h-[380px] xl:block"
            aria-hidden
          >
            <Image
              src={hero.src}
              alt=""
              fill
              className="object-contain object-center p-8 opacity-90"
              sizes="40vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent" />
          </div>
        )}
        <div className="relative mx-auto max-w-[var(--container)] px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={data.breadcrumbs} className="mb-5" />
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            Buying Guide
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="mt-3 max-w-2xl text-muted">{guide.subtitle}</p>
          )}
          <MetaRow data={data} />
          {showHero && (
            <div className="relative mt-8 aspect-[16/10] w-full max-w-xl overflow-hidden bg-surface-muted/30 xl:hidden">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                className="object-contain p-6"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto grid max-w-[var(--container)] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:px-8">
        <article className="min-w-0 space-y-10">
          {guide.quickAnswer && (
            <p className="border-l-2 border-accent pl-4 text-[16px] leading-relaxed">
              {guide.quickAnswer}
            </p>
          )}
          <GuideApproachStrip products={data.productExamples} />
          {guide.sections.map((section, i) => {
            const paragraphs = section.body
              .trim()
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
              <GuideSection key={section.id} id={section.id}>
                <GuideNumberedHeading number={i + 1} title={section.heading} />
                <div className="mt-3 space-y-3">
                  {paragraphs.map((para) => (
                    <p
                      key={para.slice(0, 48)}
                      className="text-[15px] leading-relaxed text-muted"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </GuideSection>
            );
          })}
          {faqs.length > 0 && (
            <GuideSection id="faq">
              <h2 className="font-display text-2xl font-bold">FAQ</h2>
              <dl className="mt-4 space-y-4">
                {faqs.map((f) => (
                  <div key={f.id}>
                    <dt className="font-semibold">{f.question}</dt>
                    <dd className="mt-1 text-muted">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </GuideSection>
          )}
          <GuideProductRail
            title="Example products"
            products={data.productExamples}
          />
          <GuideRelatedComparisons
            comparisons={data.relatedComparisons}
            title="Head-to-head comparisons"
          />
          {tools[0] && (
            <Link
              href={`/tools/${tools[0].slug}`}
              className="inline-flex h-11 items-center bg-accent px-5 text-[12px] font-bold uppercase tracking-wide text-accent-foreground"
            >
              Use {tools[0].name} →
            </Link>
          )}
          {author && <AuthorCard author={author} />}
        </article>
        <aside className="hidden lg:block">
          <GuideSidebar data={data} variant="full" />
        </aside>
      </div>
      <TrustRow />
    </>
  );
}
