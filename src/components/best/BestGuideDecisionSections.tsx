import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { GuideContextComparisonInline } from "@/components/best/BestGuideDetailedPicks";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";

export function BestGuideQuickTake({ data }: { data: BestGuidePageData }) {
  const takes = data.guide.quickTake;
  if (!takes?.length) return null;

  return (
    <section className="border-b border-border py-6">
      <Container size="wide">
        <h2 className="text-[11px] font-bold tracking-[0.1em] text-subtle uppercase">
          Our quick take
        </h2>
        <ul className="mt-3 max-w-3xl space-y-2">
          {takes.map((line) => (
            <li
              key={line}
              className="text-[15px] leading-relaxed text-foreground"
            >
              {line}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function BestGuideDecisionShortcuts({
  data,
}: {
  data: BestGuidePageData;
}) {
  const shortcuts = data.guide.decisionShortcuts;
  if (!shortcuts?.length) return null;

  const contextLabel = data.primaryUseCase?.name ?? data.contextConfig.label;
  const finderHref = data.finderHref;
  const noun =
    (data.config.productNoun ?? "product").replace(/s$/i, "") || "product";

  return (
    <section className="border-y border-border bg-[#f7f7f5] py-8">
      <Container size="wide">
        <h2 className="heading-section">
          Which {contextLabel.toLowerCase()} {noun} should you choose?
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Decision shortcuts — not a fake personalized quiz. Jump to the pick
          that matches your priority.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((s) => {
            const rec = data.recommendations.find(
              (r) => r.product.id === s.productId,
            );
            const name = rec
              ? rec.brand?.name
                ? `${rec.brand.name} ${rec.product.name}`
                : rec.product.name
              : s.productId;
            const href = rec ? `#rec-${rec.product.slug}` : undefined;
            return (
              <li
                key={`${s.need}-${s.productId}`}
                className="border border-border bg-surface px-4 py-4"
              >
                <p className="text-[12px] font-bold tracking-wide text-subtle uppercase">
                  If you want
                </p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">
                  {s.need}
                </p>
                <p className="mt-2 text-[14px] text-foreground">
                  →{" "}
                  {href ? (
                    <Link
                      href={href}
                      className="font-medium text-link hover:underline"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </p>
                {s.reason && (
                  <p className="mt-1.5 text-[12px] leading-snug text-muted">
                    {s.reason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {finderHref && (
          <p className="mt-6 text-[14px] text-muted">
            Still unsure?{" "}
            <Link
              href={finderHref}
              className="font-medium text-link hover:underline"
            >
              Use the Running Shoe Finder →
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}

export function BestGuideContextComparison({
  data,
}: {
  data: BestGuidePageData;
}) {
  if (data.contextComparisonRows.length === 0) return null;
  if (data.recommendations.length < 2) return null;

  return (
    <section className="py-8">
      <Container size="wide">
        <GuideContextComparisonInline data={data} />
      </Container>
    </section>
  );
}
