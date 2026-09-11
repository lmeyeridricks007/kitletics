import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { GuideEvaluatedProductsDisclosure } from "@/components/best/GuideEvaluatedProductsDisclosure";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import {
  compareHrefForRunnerUp,
  diversityNarrative,
  guideRoleCoverageChips,
  narrowingNarrative,
  selectNotableRunnerUps,
} from "@/lib/best/guide-selection-summary";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getBrandById } from "@/repositories";

/**
 * How we narrowed the field — premium research summary.
 * Funnel + notable runners-up + optional full evaluated list.
 * Does not re-list recommended products (already covered above).
 */
export function BestGuideProductsConsidered({
  data,
}: {
  data: BestGuidePageData;
}) {
  const {
    coverage,
    candidateEvaluations,
    config,
    guide,
    recommendations,
    category,
    primaryUseCase,
  } = data;

  if (!coverage.hasAuthenticConsideredSet || candidateEvaluations.length === 0) {
    return null;
  }

  const noun = (config.productNoun ?? "products").toLowerCase();
  const singular =
    noun.endsWith("s") && !noun.endsWith("ss")
      ? noun.slice(0, -1)
      : noun;

  const recommended = candidateEvaluations.filter(
    (e) => e.status === "recommended",
  );
  const shortlistedOnly = candidateEvaluations.filter(
    (e) => e.status === "shortlisted",
  );
  const others = candidateEvaluations.filter(
    (e) => e.status === "considered" || e.status === "rejected",
  );

  const runnersUp = selectNotableRunnerUps(candidateEvaluations, 5);
  const roleChips = guideRoleCoverageChips(guide.recommendations);
  const diversity = diversityNarrative(guide.recommendations);
  const narrative = narrowingNarrative({
    guide,
    consideredCount: coverage.consideredCount,
    shortlistedCount: coverage.shortlistedCount,
    recommendedCount: coverage.recommendedCount,
    productNoun: noun,
    useCaseLabel: primaryUseCase?.name,
  });

  const categorySlug = category?.slug ?? "running-shoes";
  const recById = new Map(recommendations.map((r) => [r.product.id, r]));

  return (
    <section className="border-t border-border py-10">
      <Container size="wide">
        <h2 className="heading-section">How we narrowed the field</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          {narrative}
        </p>

        <GuideSelectionFunnel
          evaluated={coverage.consideredCount}
          shortlisted={coverage.shortlistedCount}
          recommended={coverage.recommendedCount}
          productNoun={singular}
        />

        <p className="mt-4">
          <Link
            href="/methodology"
            className="text-[13px] font-medium text-link hover:underline"
          >
            How we evaluate products →
          </Link>
        </p>

        {roleChips.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
              Final picks cover
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {roleChips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-[3px] border border-border bg-white px-2.5 py-1 text-[12px] font-medium text-foreground"
                >
                  {chip}
                </li>
              ))}
            </ul>
            {diversity && (
              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">
                {diversity}
              </p>
            )}
          </div>
        )}

        {runnersUp.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
              Notable runners-up
            </h3>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {runnersUp.map((row) => {
                const product = row.product!;
                const brand = getBrandById(product.brandId);
                const media = getPrimaryProductMedia(product);
                const closest = row.closestRecommendedProductId
                  ? recById.get(row.closestRecommendedProductId)
                  : undefined;
                const compareHref = compareHrefForRunnerUp({
                  runnerUpSlug: product.slug,
                  closestRecommendedSlug: closest?.product.slug,
                  categorySlug,
                });

                return (
                  <li
                    key={row.productId}
                    className="grid gap-4 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-start"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative aspect-[4/3] w-[72px] bg-surface-muted/40"
                    >
                      {media ? (
                        <Image
                          src={media.src}
                          alt={media.alt || product.fullName}
                          fill
                          className="object-contain p-1"
                          sizes="72px"
                        />
                      ) : null}
                    </Link>
                    <div className="min-w-0">
                      {brand && (
                        <p className="text-[10px] font-bold tracking-wide text-subtle uppercase">
                          {brand.name}
                        </p>
                      )}
                      <p className="text-[15px] font-semibold text-foreground">
                        <Link
                          href={`/products/${product.slug}`}
                          className="hover:text-link"
                        >
                          {product.name}
                        </Link>
                      </p>
                      {row.publicReason && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                          {row.publicReason}
                        </p>
                      )}
                      {row.stillConsiderIf && (
                        <p className="mt-2 text-[12px] text-foreground">
                          <span className="font-bold tracking-wide text-subtle uppercase">
                            Still consider if{" "}
                          </span>
                          {row.stillConsiderIf}
                        </p>
                      )}
                    </div>
                    <div className="sm:pt-1">
                      <Link
                        href={compareHref}
                        className="text-[12px] font-medium text-link hover:underline"
                      >
                        {closest
                          ? `Compare with ${closest.product.name} →`
                          : "Compare →"}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <GuideEvaluatedProductsDisclosure
          consideredCount={coverage.consideredCount}
          productNoun={noun}
          recommended={recommended}
          shortlisted={shortlistedOnly}
          others={others}
          recommendations={guide.recommendations}
          categorySlug={categorySlug}
        />
      </Container>
    </section>
  );
}

function GuideSelectionFunnel({
  evaluated,
  shortlisted,
  recommended,
  productNoun,
}: {
  evaluated: number;
  shortlisted: number;
  recommended: number;
  productNoun: string;
}) {
  return (
    <div
      className="mt-6"
      role="group"
      aria-label={`${evaluated} evaluated, ${shortlisted} shortlisted, ${recommended} recommended`}
    >
      <ol className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
        <FunnelStep
          count={evaluated}
          label="Evaluated"
          detail={`Current eligible ${productNoun}s`}
          emphasize={false}
        />
        <li
          className="hidden items-center justify-center text-subtle sm:flex"
          aria-hidden
        >
          →
        </li>
        <FunnelStep
          count={shortlisted}
          label="Shortlisted"
          detail="Passed our core criteria"
          emphasize={false}
        />
        <li
          className="hidden items-center justify-center text-subtle sm:flex"
          aria-hidden
        >
          →
        </li>
        <FunnelStep
          count={recommended}
          label="Recommended"
          detail="Distinct picks worth considering"
          emphasize
        />
      </ol>
      {/* Screen-reader friendly linear summary already via aria-label */}
    </div>
  );
}

function FunnelStep({
  count,
  label,
  detail,
  emphasize,
}: {
  count: number;
  label: string;
  detail: string;
  emphasize: boolean;
}) {
  return (
    <li
      className={`border px-4 py-4 ${
        emphasize
          ? "border-accent bg-accent/10"
          : "border-border bg-white"
      }`}
    >
      <p
        className={`font-display text-3xl font-bold tabular-nums tracking-tight ${
          emphasize ? "text-foreground" : "text-foreground"
        }`}
      >
        {count}
      </p>
      <p
        className={`mt-1 text-[11px] font-bold tracking-[0.12em] uppercase ${
          emphasize ? "text-accent-ink" : "text-subtle"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-muted">{detail}</p>
    </li>
  );
}
