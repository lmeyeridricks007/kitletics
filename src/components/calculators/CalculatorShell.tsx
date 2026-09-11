import Link from "next/link";
import type { CalculatorDefinition } from "@/domain/calculators/types";
import type { Tool } from "@/domain/tools/types";
import type { BestGuide } from "@/domain/editorial/types";
import type { BuyingGuide } from "@/domain/editorial/types";
import { ButtonLink } from "@/components/ui/Button";

export function CalculatorMethodology({
  definition,
}: {
  definition: CalculatorDefinition;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-semibold">
        {definition.methodologyTitle}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
        {definition.methodologyBody.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {definition.formulaDisplay && (
        <div className="mt-5 rounded-xl bg-surface-muted p-4">
          <p className="font-mono text-sm">{definition.formulaDisplay}</p>
          {definition.formulaDefinitions && (
            <dl className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
              {definition.formulaDefinitions.map((d) => (
                <div key={d.symbol}>
                  <dt className="inline font-medium text-foreground">
                    {d.symbol}
                  </dt>
                  <dd className="inline"> — {d.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
      {definition.limitations && definition.limitations.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">
            Limitations
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {definition.limitations.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function CalculatorFaq({
  definition,
  basePath,
}: {
  definition: CalculatorDefinition;
  basePath: string;
}) {
  if (definition.faqs.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">FAQ</h2>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
        {definition.faqs.map((faq) => (
          <details key={faq.question} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm text-muted">{faq.answer}</p>
            {faq.exampleQuery && (
              <Link
                href={`${basePath}?${faq.exampleQuery}`}
                className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
              >
                Try this example →
              </Link>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}

export function CalculatorRelatedTools({
  tools,
}: {
  tools: Tool[];
}) {
  const live = tools.filter((t) => t.available);
  if (live.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Related tools</h2>
      <ul className="mt-4 space-y-2">
        {live.map((tool) => (
          <li key={tool.id}>
            <Link
              href={`/tools/${tool.slug}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {tool.name} →
            </Link>
            <p className="text-xs text-muted">{tool.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CalculatorRelatedGuides({
  bestGuides,
  buyingGuides,
}: {
  bestGuides: BestGuide[];
  buyingGuides: BuyingGuide[];
}) {
  if (bestGuides.length === 0 && buyingGuides.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Related guides</h2>
      <ul className="mt-4 space-y-2">
        {bestGuides.map((g) => (
          <li key={g.id}>
            <Link
              href={`/best/${g.slug}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {g.title} →
            </Link>
          </li>
        ))}
        {buyingGuides.map((g) => (
          <li key={g.id}>
            <Link
              href={`/guides/${g.slug}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {g.title} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CalculatorShoeFinderCta() {
  return (
    <section className="rounded-2xl border border-border bg-charcoal-950 p-6 text-white dark:bg-charcoal-900">
      <p className="font-display text-xl font-semibold">Training for a race?</p>
      <p className="mt-2 text-sm text-white/75">
        Find running shoes matched to your training.
      </p>
      <ButtonLink
        href="/tools/running-shoe-finder"
        className="mt-4"
        size="sm"
      >
        Running Shoe Finder →
      </ButtonLink>
    </section>
  );
}

export function CalculatorHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-muted">{description}</p>
    </div>
  );
}
