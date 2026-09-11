import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductCategoryPageConfig } from "@/lib/catalog/types";

type Decision = NonNullable<ProductCategoryPageConfig["decision"]>;

/** Compact discovery decision block — scannable, not an SEO essay. */
export function CategoryDecisionSection({ decision }: { decision: Decision }) {
  return (
    <section
      id="how-to-choose-decision"
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
          How to choose
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Decision guide
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">{decision.whatItIs}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DecisionCard title="Product types">
            <ul className="space-y-2">
              {decision.productTypes.map((t) => (
                <li key={t.name} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{t.name}.</span>{" "}
                  {t.note}
                </li>
              ))}
            </ul>
          </DecisionCard>

          <DecisionCard title="What matters">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted">
              {decision.whatMatters.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </DecisionCard>

          <DecisionCard title="Specs that matter">
            <ul className="space-y-2">
              {decision.specsThatMatter.map((s) => (
                <li key={s.spec} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{s.spec}.</span>{" "}
                  {s.why}
                </li>
              ))}
            </ul>
          </DecisionCard>

          <DecisionCard title="Common trade-offs">
            <ul className="space-y-2">
              {decision.tradeOffs.map((t) => (
                <li key={`${t.left}-${t.right}`} className="text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {t.left} ↔ {t.right}.
                  </span>{" "}
                  {t.note}
                </li>
              ))}
            </ul>
          </DecisionCard>

          <DecisionCard title="When use case changes the choice">
            <ul className="space-y-2">
              {decision.useCaseShifts.map((u) => (
                <li key={u.useCase} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{u.useCase}.</span>{" "}
                  {u.note}
                </li>
              ))}
            </ul>
          </DecisionCard>

          <DecisionCard title="Beginner start">
            <p className="text-sm text-muted">{decision.beginnerStart}</p>
          </DecisionCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-sm">
          {decision.relatedBestHref && (
            <Link
              href={decision.relatedBestHref}
              className="font-medium text-accent-ink hover:underline"
            >
              {decision.relatedBestLabel ?? "Best guide"} →
            </Link>
          )}
          {decision.relatedFinderHref && (
            <Link
              href={decision.relatedFinderHref}
              className="font-medium text-accent-ink hover:underline"
            >
              {decision.relatedFinderLabel ?? "Finder"} →
            </Link>
          )}
          {decision.relatedGuideHref && (
            <Link
              href={decision.relatedGuideHref}
              className="font-medium text-accent-ink hover:underline"
            >
              {decision.relatedGuideLabel ?? "Guide"} →
            </Link>
          )}
        </div>
        {decision.usefulComparisonsNote && (
          <p className="mt-3 text-[13px] text-subtle">
            Comparisons: {decision.usefulComparisonsNote}
          </p>
        )}
      </div>
    </section>
  );
}

function DecisionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-border bg-background p-5">
      <h3 className="font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
