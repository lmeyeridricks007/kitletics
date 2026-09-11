import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import type {
  AlternativeRow,
  FamilyMember,
  UseCaseScoreRow,
  ProductPageData,
} from "@/lib/product/get-product-page-data";
import type { Evidence } from "@/domain/recommendations/types";
import { formatVerifiedDate } from "@/lib/product/score";
import { getPublicEvidenceCard } from "@/lib/evidence/public-presentation";

const EVIDENCE_LABELS: Record<string, string> = {
  "personal-test": "First-hand testing",
  manufacturer: "Verified specification",
  retailer: "Retailer product data",
  "independent-review": "Independent expert reviews",
  "lab-test": "Lab & test data",
  "user-feedback": "Aggregated public feedback",
  "editorial-research": "Editorial research",
};

export function UseCasePerformance({ rows }: { rows: UseCaseScoreRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted/60 text-left text-xs tracking-wide text-subtle uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Use case</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.recommendation.id} className="border-t border-border">
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{row.label}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {row.recommendation.explanation}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-display text-lg font-semibold tabular-nums text-accent">
                  {row.recommendation.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function suitabilityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "Limited";
}

/** Secondary HYROX context module — never replaces the primary sport framing. */
export function HyroxPerformanceModule({ rows }: { rows: UseCaseScoreRow[] }) {
  const hyroxRows = rows.filter(
    (r) =>
      r.recommendation.sportId === "sport-hyrox" ||
      r.recommendation.useCaseId?.includes("hyrox"),
  );
  if (hyroxRows.length === 0) return null;

  const race = hyroxRows.find((r) => r.recommendation.useCaseId === "uc-hyrox-race");
  const training = hyroxRows.find(
    (r) => r.recommendation.useCaseId === "uc-hyrox-training",
  );
  const primary = race ?? training ?? hyroxRows[0];
  const factors = primary.recommendation.factors;

  return (
    <section
      id="hyrox"
      className="scroll-mt-28 space-y-4 rounded-2xl border border-border bg-surface-muted/40 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
            Secondary context
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            HYROX performance
          </h2>
        </div>
        <Link
          href="/fitness/hyrox"
          className="text-sm font-medium text-accent hover:underline"
        >
          HYROX gear hub →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {race && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs tracking-wide text-subtle uppercase">
              Race suitability
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-accent">
              {suitabilityLabel(race.recommendation.score)}
            </p>
          </div>
        )}
        {training && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs tracking-wide text-subtle uppercase">
              Training suitability
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-accent">
              {suitabilityLabel(training.recommendation.score)}
            </p>
          </div>
        )}
      </div>

      {factors.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {factors.map((f) => (
            <li
              key={f.key}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-muted">{f.label || f.key}</span>
              <span className="font-medium tabular-nums text-foreground">
                {suitabilityLabel(f.score)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {primary.recommendation.strengths[0] && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Best for: </span>
          {primary.recommendation.strengths.join("; ")}
        </p>
      )}
      {primary.recommendation.compromises[0] && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Trade-off: </span>
          {primary.recommendation.compromises.join("; ")}
        </p>
      )}

      <p className="text-xs text-subtle">
        Qualitative labels from structured recommendations — not measured race
        times.{" "}
        <Link href="/tools/hyrox-shoe-finder" className="text-accent hover:underline">
          Find HYROX shoes
        </Link>
      </p>
    </section>
  );
}

export function AlternativeProducts({
  alternatives,
}: {
  alternatives: AlternativeRow[];
}) {
  if (alternatives.length === 0) return null;

  const grouped = new Map<string, AlternativeRow[]>();
  for (const alt of alternatives) {
    const key = alt.reasonLabel;
    grouped.set(key, [...(grouped.get(key) ?? []), alt]);
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([reason, items]) => (
        <div key={reason}>
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            {reason}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.relationship.id}
                href={`/products/${item.product.slug}`}
                className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent"
              >
                {item.brand && (
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">
                    {item.brand.name}
                  </p>
                )}
                <h3 className="mt-1 font-display text-base font-semibold">
                  {item.product.name}
                </h3>
                {item.relationship.reasons[0] && (
                  <p className="mt-2 text-sm text-muted">
                    {item.relationship.reasons[0]}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductFamilySection({
  familyName,
  members,
  newer,
  older,
}: {
  familyName: string;
  members: FamilyMember[];
  newer?: ProductPageData["newerGeneration"];
  older?: ProductPageData["olderGeneration"];
}) {
  if (members.length === 0) return null;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">{familyName} family</h2>
      {newer && (
        <p className="text-sm text-muted">
          Newer:{" "}
          <Link
            href={`/products/${newer.slug}`}
            className="font-medium text-accent hover:underline"
          >
            {newer.name} →
          </Link>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(({ product, isCurrent }) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className={`rounded-2xl border p-4 ${
              isCurrent
                ? "border-accent bg-accent-muted/30"
                : "border-border bg-surface hover:border-accent"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-semibold">{product.name}</p>
              <Badge variant={isCurrent ? "accent" : "muted"}>
                {product.lifecycleStatus === "current"
                  ? "Current"
                  : product.lifecycleStatus === "previous-generation"
                    ? "Previous"
                    : product.lifecycleStatus}
              </Badge>
            </div>
            {product.generation && (
              <p className="mt-1 text-xs text-subtle">
                Generation {product.generation}
              </p>
            )}
          </Link>
        ))}
      </div>
      {older && older.lifecycleStatus === "previous-generation" && (
        <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            Previous generation
          </p>
          <Link
            href={`/products/${older.slug}`}
            className="mt-1 inline-block font-display text-lg font-semibold text-accent hover:underline"
          >
            {older.fullName}
          </Link>
          <p className="mt-1 text-sm text-muted">
            Older model — still listed when offers exist.
          </p>
        </div>
      )}
    </div>
  );
}

export function EvidenceSummary({
  evidence,
  hasPersonalTest,
}: {
  evidence: Evidence[];
  hasPersonalTest: boolean;
}) {
  if (evidence.length === 0) return null;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">
        How we assessed this product
      </h2>
      {!hasPersonalTest && (
        <p className="text-sm text-muted">
          Kitletics has not personally tested this product. Claims below are
          limited to the linked evidence types.
        </p>
      )}
      <ul className="space-y-3">
        {evidence.map((ev) => {
          const card = getPublicEvidenceCard(ev);
          return (
            <li
              key={ev.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={ev.type === "personal-test" ? "accent" : "muted"}>
                  {EVIDENCE_LABELS[ev.type] ?? card.typeLabel}
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                {card.sourceUrl ? (
                  <a
                    href={card.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent hover:underline"
                  >
                    {card.title}
                  </a>
                ) : (
                  card.title
                )}
              </p>
              <p className="mt-1 text-sm text-muted">{card.body}</p>
              {card.verifiedAt && (
                <p className="mt-2 text-xs text-subtle">
                  Verified {formatVerifiedDate(card.verifiedAt)}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ComparisonPreview({
  data,
}: {
  data: ProductPageData;
}) {
  if (data.comparisons.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">
          Compare this product
        </h2>
        <AddToCompareButton
          product={{
            slug: data.product.slug,
            name: data.product.name,
            brandName: data.brand?.name,
            categoryId: data.product.categoryId,
            categorySlug: data.category?.slug ?? "",
          }}
          source="product-compare-section"
          variant="outline"
          size="sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.comparisons.map((comparison) => {
          const names = data.comparisonNames[comparison.id] ?? [];
          return (
            <Link
              key={comparison.id}
              href={`/compare/${comparison.slug}`}
              className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
            >
              <Badge variant="muted">Comparison</Badge>
              {names.length === 2 ? (
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                  {names[0]}
                  <span className="mx-2 text-subtle">vs</span>
                  {names[1]}
                </h3>
              ) : (
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {comparison.title}
                </h3>
              )}
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {comparison.summary}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-accent">
                Full comparison →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
