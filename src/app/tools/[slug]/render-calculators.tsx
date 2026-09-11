import Link from "next/link";
import { notFound } from "next/navigation";
import { PaceCalculatorApp } from "@/components/calculators/PaceCalculatorApp";
import { RacePredictorApp } from "@/components/calculators/RacePredictorApp";
import { StrengthCalculatorsClient } from "@/components/calculators/StrengthCalculatorsClient";
import {
  CalculatorFaq,
  CalculatorHero,
  CalculatorMethodology,
  CalculatorRelatedGuides,
  CalculatorRelatedTools,
  CalculatorShoeFinderCta,
} from "@/components/calculators/CalculatorShell";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  JsonLdScript,
  webApplicationJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/jsonld";
import { getCalculatorDefinition } from "@/domain/calculators/registry";
import {
  getBestGuideBySlug,
  getBuyingGuideBySlug,
  getToolBySlug,
} from "@/repositories";
import type { FAQ } from "@/domain/editorial/types";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function renderPaceCalculatorPage(input: {
  slug: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { slug, searchParams: sp } = input;
  const definition = getCalculatorDefinition("running-pace-calculator");
  if (!definition) notFound();
  const initialQuery: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    initialQuery[k] = firstParam(v);
  }
  if (
    process.env.NODE_ENV === "development" &&
    initialQuery.fixture === "visual-reference" &&
    !initialQuery.time
  ) {
    initialQuery.mode = "pace";
    initialQuery.distance = "10k";
    initialQuery.time = "2730";
    initialQuery.unit = "km";
  }
  const relatedTools = definition.relatedToolSlugs
    .map((toolSlug) => getToolBySlug(toolSlug, { isDev: false }))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const paceGuide = getBuyingGuideBySlug("how-to-choose-running-shoes", {
    isDev: false,
  });
  const faqEntities: FAQ[] = definition.faqs.map((f, i) => ({
    id: `pace-faq-${i}`,
    question: f.question,
    answer: f.answer,
    sportId: "sport-running",
  }));
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: definition.title, href: `/tools/${slug}` },
          ]),
          webApplicationJsonLd({
            name: definition.title,
            description: definition.description,
            url: `/tools/${slug}`,
          }),
          faqPageJsonLd(faqEntities),
        ].filter(Boolean)}
      />
      <PaceCalculatorApp
        definition={{
          ...definition,
          formulaDisplay: definition.formulaDisplay ?? "pace = time ÷ distance",
        }}
        initialQuery={initialQuery}
        relatedTools={relatedTools}
        helpGuideHref={
          paceGuide
            ? `/guides/${paceGuide.slug}`
            : "/guides/how-to-choose-running-shoes"
        }
        helpGuideLabel="View pace & training guide"
        heroImageSrc="/images/running/category/use-race.jpg"
        estimatedMinutes={1}
      />
      <Container className="py-10 sm:py-12">
        <CalculatorFaq definition={definition} basePath={`/tools/${slug}`} />
      </Container>
    </>
  );
}

export async function renderRacePredictorPage(input: {
  slug: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { slug, searchParams: sp } = input;
  const definition = getCalculatorDefinition("race-time-predictor");
  if (!definition) notFound();
  const initialQuery: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    initialQuery[k] = firstParam(v);
  }
  const relatedTools = definition.relatedToolSlugs
    .map((toolSlug) => getToolBySlug(toolSlug, { isDev: false }))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const bestGuides = (definition.relatedGuideSlugs ?? [])
    .map((guideSlug) => getBestGuideBySlug(guideSlug, { isDev: false }))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const buyingGuides = (definition.relatedGuideSlugs ?? [])
    .map((guideSlug) => getBuyingGuideBySlug(guideSlug, { isDev: false }))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const faqEntities: FAQ[] = definition.faqs.map((f, i) => ({
    id: `predictor-faq-${i}`,
    question: f.question,
    answer: f.answer,
    sportId: "sport-running",
  }));
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: definition.title, href: `/tools/${slug}` },
          ]),
          webApplicationJsonLd({
            name: definition.title,
            description: definition.description,
            url: `/tools/${slug}`,
          }),
          faqPageJsonLd(faqEntities),
        ].filter(Boolean)}
      />
      <div className="border-b border-border bg-mesh">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: definition.title },
            ]}
            className="mb-8"
          />
          <CalculatorHero
            eyebrow="Calculator"
            title={definition.title}
            description={definition.description}
          />
          <p className="mt-4 max-w-2xl text-sm text-muted">
            This extrapolates performance across distances — different from the{" "}
            <Link
              href="/tools/running-pace-calculator"
              className="text-accent hover:underline"
            >
              Pace Calculator
            </Link>
            , which does known pace/time arithmetic.
          </p>
        </Container>
      </div>
      <Container className="space-y-14 py-10 sm:py-14">
        <RacePredictorApp definition={definition} initialQuery={initialQuery} />
        <CalculatorMethodology definition={definition} />
        <div className="grid gap-10 lg:grid-cols-2">
          <CalculatorRelatedTools tools={relatedTools} />
          <CalculatorRelatedGuides
            bestGuides={bestGuides}
            buyingGuides={buyingGuides}
          />
        </div>
        <CalculatorShoeFinderCta />
        <CalculatorFaq definition={definition} basePath={`/tools/${slug}`} />
      </Container>
    </>
  );
}

export function renderStrengthCalculatorsPage(input: {
  slug: string;
  tool: { name: string; description: string; slug: string };
}) {
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: input.tool.name,
          description: input.tool.description,
          url: `/tools/${input.tool.slug}`,
        })}
      />
      <StrengthCalculatorsClient
        initial={input.slug === "plate-calculator" ? "plates" : "1rm"}
      />
    </>
  );
}
