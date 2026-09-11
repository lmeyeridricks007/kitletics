import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PriceBadge } from "@/components/content/PriceBadge";
import type { RotationResultsPageData } from "@/lib/rotation/get-rotation-results-data";
import { ROLE_BY_ID, coverageStatusLabel } from "@/domain/shoe-rotation/roles";
import { ShareRotationButton } from "@/components/rotation/ShareRotationButton";

export function RotationResultsView({
  data,
  sharePath,
  encodedState,
}: {
  data: RotationResultsPageData;
  sharePath: string;
  encodedState: string;
}) {
  const { result } = data;
  const editHref = `/tools/shoe-rotation-planner?s=${encodeURIComponent(encodedState)}&edit=1`;
  const isImprove = result.profile.mode === "improve";

  return (
    <>
      <div className="border-b border-border bg-mesh">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              {
                label: "Shoe Rotation Planner",
                href: "/tools/shoe-rotation-planner",
              },
              { label: "Results" },
            ]}
            className="mb-8"
          />
          <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
            {isImprove ? "Your rotation" : `Your ${result.recommendedSize}-shoe rotation`}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {isImprove && result.additions[0]
              ? "Best next addition for your setup"
              : "Shoes that work together"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            {result.coverageSummary}. {result.sizeExplanation}
          </p>
          {isImprove && result.gaps[0] && (
            <p className="mt-4 text-sm">
              Biggest gap:{" "}
              <span className="font-medium">
                {ROLE_BY_ID[result.gaps[0].roleId].label}
              </span>
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={editHref} variant="outline" size="sm">
              Edit answers
            </ButtonLink>
            {data.compareRotationHref && (
              <ButtonLink href={data.compareRotationHref} size="sm">
                Compare this rotation
              </ButtonLink>
            )}
            <ShareRotationButton path={sharePath} />
          </div>
        </Container>
      </div>

      <Container className="space-y-12 py-10 sm:py-14">
        {isImprove && data.ownedCards.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold">
              Your current shoes
            </h2>
            <div className="mt-4 space-y-3">
              {data.ownedCards.map((card) => (
                <ShoeRow key={card.product.id} card={card} />
              ))}
            </div>
          </section>
        )}

        {isImprove && data.additionCards.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold">
              Best next addition
            </h2>
            <div className="mt-6 space-y-6">
              {data.additionCards.map((card) => (
                <article
                  key={card.product.id}
                  className="rounded-3xl border border-border bg-surface p-6 sm:p-8"
                >
                  <Badge variant="accent">
                    {card.addition.rank === 1 ? "Add first" : `Add ${card.addition.rank === 2 ? "second" : "next"}`}
                  </Badge>
                  <h3 className="mt-3 font-display text-2xl font-semibold">
                    {card.brand?.name} {card.product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Primary: {card.primaryRoles.join(" + ") || "—"}
                    {card.secondaryRoles.length > 0 &&
                      ` · Also: ${card.secondaryRoles.join(", ")}`}
                  </p>
                  {card.lowestPrice ? (
                    <div className="mt-3">
                      <PriceBadge
                        amount={card.lowestPrice.price}
                        currency={card.lowestPrice.currency}
                        from
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-subtle">
                      No current offer found
                    </p>
                  )}
                  <div className="mt-5">
                    <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                      Why it fits your rotation
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                      {card.addition.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                      <li>{card.addition.overlapNote}</li>
                    </ul>
                  </div>
                  {card.addition.compromises.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                        What to know
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                        {card.addition.compromises.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <Link
                      href={`/products/${card.product.slug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      View Product
                    </Link>
                    {card.review && (
                      <Link
                        href={`/reviews/${card.review.slug}`}
                        className="font-medium text-accent hover:underline"
                      >
                        Read Review
                      </Link>
                    )}
                    {data.ownedCards[0] && (
                      <Link
                        href={`/compare?category=running-shoes&products=${[
                          card.product.slug,
                          data.ownedCards[0].product.slug,
                        ].join(",")}`}
                        className="font-medium text-accent hover:underline"
                      >
                        Compare with my shoes
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!isImprove && (
          <section>
            <h2 className="font-display text-2xl font-semibold">
              Recommended rotation
            </h2>
            <ol className="mt-6 space-y-4">
              {data.recommendedCards.map((card, i) => (
                <li
                  key={card.product.id}
                  className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
                >
                  <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {card.primaryRoles.join(" + ") || "Versatile"}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold">
                    {card.brand?.name} {card.product.name}
                  </h3>
                  {card.secondaryRoles.length > 0 && (
                    <p className="mt-1 text-sm text-muted">
                      Also good for: {card.secondaryRoles.join(", ")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {card.lowestPrice && (
                      <PriceBadge
                        amount={card.lowestPrice.price}
                        currency={card.lowestPrice.currency}
                        from
                      />
                    )}
                    <Link
                      href={`/products/${card.product.slug}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      View Product
                    </Link>
                    {card.review && (
                      <Link
                        href={`/reviews/${card.review.slug}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {result.primarySet.estimatedCost !== undefined && (
              <p className="mt-4 text-sm text-muted">
                Estimated known cost:{" "}
                {result.primarySet.estimatedCost.toFixed(0)}{" "}
                {result.profile.budgetCurrency}
                {result.primarySet.missingPriceCount > 0 &&
                  ` · ${result.primarySet.missingPriceCount} product(s) have no current regional price`}
              </p>
            )}
            <p className="mt-2 text-xs text-subtle">{result.sizeExplanation}</p>
          </section>
        )}

        <CoverageSection data={data} />

        {result.gaps.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold">
              Gaps in your rotation
            </h2>
            <ul className="mt-4 space-y-3">
              {result.gaps.map((g) => (
                <li
                  key={g.roleId}
                  className="rounded-xl border border-border p-4 text-sm"
                >
                  <p className="font-medium">{ROLE_BY_ID[g.roleId].label}</p>
                  <p className="mt-1 text-muted">{g.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.overlaps.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold">Overlap</h2>
            <ul className="mt-4 space-y-3">
              {result.overlaps.slice(0, 3).map((o, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border p-4 text-sm text-muted"
                >
                  {o.explanation}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.alternativeCards.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold">
              Alternative rotations
            </h2>
            <div className="mt-4 space-y-4">
              {data.alternativeCards.map((alt) => (
                <div
                  key={alt.id}
                  className="rounded-2xl border border-border p-5"
                >
                  <p className="font-display text-lg font-semibold">
                    {alt.label}
                  </p>
                  <p className="mt-1 text-sm text-muted">{alt.reason}</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {alt.cards.map((c) => (
                      <li key={c.product.id}>
                        {c.brand?.name} {c.product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface-muted p-6">
          <h2 className="font-display text-lg font-semibold">
            How the rotation planner works
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>We identify the types of running you need to cover.</li>
            <li>We score how well each shoe fits those roles.</li>
            <li>We look at how the shoes work together.</li>
            <li>
              We prefer combinations that cover more of your needs with less
              unnecessary overlap.
            </li>
            <li>Your budget and priorities influence the result.</li>
          </ol>
          <p className="mt-4 text-xs text-subtle">
            Affiliate commission does not affect rotation rankings. Coverage
            measures how well selected shoes cover the running roles you told us
            matter — not injury risk. {result.catalogCoverageMessage}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Related tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/tools/running-shoe-finder"
                className="font-medium text-accent hover:underline"
              >
                Running Shoe Finder →
              </Link>
            </li>
            <li>
              <Link
                href="/tools/running-pace-calculator"
                className="font-medium text-accent hover:underline"
              >
                Pace Calculator →
              </Link>
            </li>
          </ul>
        </section>

        {data.debug && (
          <pre className="overflow-auto rounded-xl bg-charcoal-950 p-4 text-xs text-white">
            {JSON.stringify(
              {
                coverageScore: result.primarySet.coverageScore,
                overlapPenalty: result.primarySet.overlapPenalty,
                totalScore: result.primarySet.totalScore,
                roles: result.profile.requiredRoles,
                weights: result.profile.roleWeights,
              },
              null,
              2,
            )}
          </pre>
        )}
      </Container>
    </>
  );
}

function ShoeRow({
  card,
}: {
  card: RotationResultsPageData["ownedCards"][number];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div>
        <p className="font-medium">
          {card.brand?.name} {card.product.name}
        </p>
        <p className="text-xs text-muted">
          {card.primaryRoles.join(" + ")}
          {card.secondaryRoles.length
            ? ` · also ${card.secondaryRoles.join(", ")}`
            : ""}
        </p>
      </div>
      <Link
        href={`/products/${card.product.slug}`}
        className="text-sm text-accent hover:underline"
      >
        Product
      </Link>
    </div>
  );
}

function CoverageSection({ data }: { data: RotationResultsPageData }) {
  const coverage =
    data.result.profile.mode === "improve"
      ? data.result.primarySet.roleCoverage
      : data.result.primarySet.roleCoverage;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">Coverage overview</h2>
      <p className="mt-1 text-sm text-muted">
        Coverage measures how well your selected shoes cover the running roles
        you told us matter.
      </p>
      <div className="mt-4 space-y-3 md:hidden">
        {coverage.map((c) => (
          <div
            key={c.roleId}
            className="rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{ROLE_BY_ID[c.roleId].label}</p>
              <Badge variant="muted">{coverageStatusLabel(c.status)}</Badge>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {c.coveredBy.slice(0, 3).map((x) => {
                const card =
                  data.recommendedCards.find((r) => r.product.id === x.productId) ??
                  data.ownedCards.find((r) => r.product.id === x.productId) ??
                  data.additionCards.find((r) => r.product.id === x.productId);
                return (
                  <li key={x.productId}>
                    {card
                      ? `${card.brand?.name} ${card.product.name}`
                      : x.label ?? x.productId}
                    : {Math.round(x.suitability)}
                  </li>
                );
              })}
              {c.coveredBy.length === 0 && <li>No coverage yet</li>}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface-muted text-xs tracking-wide text-subtle uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Role
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Best shoe
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {coverage.map((c) => {
              const best = c.coveredBy[0];
              const card = best
                ? data.recommendedCards.find(
                    (r) => r.product.id === best.productId,
                  ) ??
                  data.ownedCards.find((r) => r.product.id === best.productId) ??
                  data.additionCards.find((r) => r.product.id === best.productId)
                : undefined;
              return (
                <tr key={c.roleId} className="border-t border-border">
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    {ROLE_BY_ID[c.roleId].label}
                  </th>
                  <td className="px-4 py-2.5">
                    {coverageStatusLabel(c.status)}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {card
                      ? `${card.brand?.name} ${card.product.name}`
                      : best?.label ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {Math.round(c.bestCoverage)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
