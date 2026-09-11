import Link from "next/link";
import Image from "next/image";
import {
  GuideNumberedHeading,
  GuideSection,
} from "@/components/guides/GuidePrimitives";
import type {
  ExplainerBlock,
  ExplainerGuideExtras,
} from "@/lib/guides/explainer-blocks";
import type {
  GuideProductCardData,
  LongFormGuidePageData,
} from "@/lib/guides/get-long-form-guide-page-data";
import { formatPrice } from "@/lib/utils";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { GuideApproachStrip } from "@/components/guides/GuideApproachStrip";
import {
  ConceptDiagram,
  LookForPanels,
  factorIconForId,
} from "@/components/guides/GuideConceptVisuals";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function GuideQuickAnswer({
  bullets,
  medicalNote,
}: {
  bullets: string[];
  medicalNote?: string;
}) {
  return (
    <section
      id="quick-answer"
      className="scroll-mt-28 border border-border bg-[#f7f7f5] px-5 py-5 sm:px-6"
    >
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
        The short version
      </h2>
      <ul className="mt-3 space-y-2.5">
        {bullets.map((b) => (
          <li
            key={b.slice(0, 40)}
            className="flex gap-2.5 text-[15px] leading-relaxed text-foreground"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {medicalNote && (
        <p className="mt-4 border-t border-border pt-3 text-[12px] leading-relaxed text-muted">
          {medicalNote}
        </p>
      )}
    </section>
  );
}

export function GuideExplainerBlocks({
  data,
  explainer,
}: {
  data: LongFormGuidePageData;
  explainer: ExplainerGuideExtras;
}) {
  let number = 0;
  return (
    <div className="space-y-14">
      <GuideQuickAnswer
        bullets={explainer.quickAnswerBullets}
        medicalNote={explainer.medicalNote}
      />
      <GuideApproachStrip products={data.productExamples} />
      {explainer.blocks.map((block) => {
        if (block.type === "callout" || block.type === "cta") {
          return (
            <ExplainerBlockView
              key={block.id}
              block={block}
              number={undefined}
              data={data}
            />
          );
        }
        number += 1;
        return (
          <ExplainerBlockView
            key={block.id}
            block={block}
            number={number}
            data={data}
          />
        );
      })}
    </div>
  );
}

function BlockDiagram({
  diagram,
}: {
  diagram?: { variant: Parameters<typeof ConceptDiagram>[0]["variant"]; caption: string };
}) {
  if (!diagram) return null;
  return (
    <ConceptDiagram variant={diagram.variant} caption={diagram.caption} />
  );
}

function ExplainerBlockView({
  block,
  number,
  data,
}: {
  block: ExplainerBlock;
  number?: number;
  data: LongFormGuidePageData;
}) {
  const heading =
    number !== undefined ? (
      <GuideNumberedHeading number={number} title={block.title} />
    ) : null;

  switch (block.type) {
    case "prose":
      return (
        <GuideSection id={block.id}>
          {heading}
          {block.intro && (
            <p className="mt-2 text-[14px] font-medium text-foreground">
              {block.intro}
            </p>
          )}
          <div className="mt-3 space-y-3">
            {block.paragraphs.map((p) => (
              <p
                key={p.slice(0, 48)}
                className="max-w-3xl text-[15px] leading-relaxed text-muted"
              >
                {p}
              </p>
            ))}
          </div>
          <BlockDiagram diagram={block.diagram} />
          {block.lookFor && block.lookFor.length > 0 && (
            <LookForPanels panels={block.lookFor} />
          )}
        </GuideSection>
      );

    case "callout":
      return (
        <aside
          id={block.id}
          className={`scroll-mt-28 border-l-4 px-4 py-4 ${
            block.tone === "caution"
              ? "border-amber-500 bg-amber-50/50"
              : block.tone === "accent"
                ? "border-accent bg-accent/5"
                : "border-border bg-surface-muted/40"
          }`}
        >
          <p className="text-[12px] font-bold tracking-wide text-foreground uppercase">
            {block.title}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            {block.body}
          </p>
        </aside>
      );

    case "comparison-table":
      return (
        <GuideSection id={block.id}>
          {heading}
          {block.intro && (
            <p className="mt-3 max-w-3xl text-[15px] text-muted">{block.intro}</p>
          )}
          <BlockDiagram diagram={block.diagram} />
          {!block.diagram && block.columns.length >= 2 && (
            <ComparisonVisualSummary
              columns={block.columns}
              rows={block.rows}
            />
          )}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold"> </th>
                  {block.columns.map((c) => (
                    <th key={c} className="py-2 px-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/70">
                    <th className="py-3 pr-3 text-left font-medium text-foreground">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={`${row.label}-${i}`} className="py-3 px-2 text-muted">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.footnote && (
            <p className="mt-2 text-[12px] text-subtle">{block.footnote}</p>
          )}
          {block.lookFor && block.lookFor.length > 0 && (
            <LookForPanels panels={block.lookFor} />
          )}
        </GuideSection>
      );

    case "factor-cards":
      return (
        <GuideSection id={block.id}>
          {heading}
          {block.intro && (
            <p className="mt-3 max-w-3xl text-[15px] text-muted">{block.intro}</p>
          )}
          <BlockDiagram diagram={block.diagram} />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {block.cards.map((card) => {
              const Icon = factorIconForId(card.id);
              return (
                <li
                  key={card.id}
                  className="border border-border bg-white px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-surface-muted/40">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <p className="text-[14px] font-bold text-foreground">
                      {card.title}
                    </p>
                  </div>
                  <dl className="mt-3 space-y-2 text-[13px]">
                    <div>
                      <dt className="font-semibold text-subtle uppercase tracking-wide text-[10px]">
                        What it is
                      </dt>
                      <dd className="mt-0.5 text-muted">{card.whatItIs}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-subtle uppercase tracking-wide text-[10px]">
                        How it changes the choice
                      </dt>
                      <dd className="mt-0.5 text-muted">{card.howItChanges}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-subtle uppercase tracking-wide text-[10px]">
                        What you may notice
                      </dt>
                      <dd className="mt-0.5 text-muted">{card.whatYouNotice}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </GuideSection>
      );

    case "look-for":
      return (
        <GuideSection id={block.id}>
          {heading}
          {block.intro && (
            <p className="mt-3 max-w-3xl text-[15px] text-muted">{block.intro}</p>
          )}
          <LookForPanels panels={block.panels} />
        </GuideSection>
      );

    case "timeline":
      return (
        <GuideSection id={block.id}>
          {heading}
          {block.intro && (
            <p className="mt-3 max-w-3xl text-[15px] text-muted">{block.intro}</p>
          )}
          <BlockDiagram diagram={block.diagram} />
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {block.stages.map((stage, i) => (
              <li
                key={stage.id}
                className="relative border border-border bg-white px-4 py-4"
              >
                <p className="text-[11px] font-bold tracking-wide text-accent-ink uppercase">
                  {i + 1}. {stage.label}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {stage.description}
                </p>
                <ul className="mt-3 space-y-1">
                  {stage.traits.map((t) => (
                    <li key={t} className="text-[12px] text-foreground">
                      · {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </GuideSection>
      );

    case "spectrum":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <div className="mt-5">
            <div className="flex justify-between text-[11px] font-bold tracking-wide text-subtle uppercase">
              <span>{block.lowLabel}</span>
              <span>{block.highLabel}</span>
            </div>
            <div className="relative mt-3 h-3 rounded-full bg-gradient-to-r from-surface-muted via-accent/40 to-accent">
              {block.markers.map((m) => (
                <div
                  key={m.productId}
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-white"
                  style={{ left: `${m.position}%` }}
                  title={m.label}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-1.5">
              {block.markers.map((m) => (
                <li key={m.productId} className="text-[13px] text-muted">
                  <span className="font-medium text-foreground">{m.label}</span>
                </li>
              ))}
            </ul>
            {block.note && (
              <p className="mt-3 text-[12px] text-subtle">{block.note}</p>
            )}
          </div>
        </GuideSection>
      );

    case "matrix":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <p className="mt-2 text-[12px] text-subtle">
            {block.yHigh} ↑ · {block.xLow} → {block.xHigh}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {block.cells.map((cell) => {
              const card = data.productExamples.find(
                (p) => p.product.id === cell.productId,
              );
              return (
                <li
                  key={cell.id}
                  className="border border-border bg-white px-4 py-3"
                >
                  <p className="text-[14px] font-bold">{cell.label}</p>
                  <p className="mt-1 text-[12px] text-muted">{cell.description}</p>
                  {card && (
                    <Link
                      href={`/products/${card.product.slug}`}
                      className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
                    >
                      View product →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {block.note && (
            <p className="mt-3 text-[12px] text-subtle">{block.note}</p>
          )}
        </GuideSection>
      );

    case "use-case-cards":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {block.cards.map((card, index) => (
              <li
                key={card.id}
                className="border border-border bg-white px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center bg-accent text-[12px] font-bold text-accent-foreground">
                    {index + 1}
                  </span>
                  <p className="text-[14px] font-bold leading-snug">{card.title}</p>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-muted">
                  {card.description}
                </p>
                {card.href && (
                  <Link
                    href={card.href}
                    className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
                  >
                    Explore →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </GuideSection>
      );

    case "pros-tradeoffs":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border border-border bg-white px-4 py-4">
              <p className="text-[11px] font-bold tracking-wide text-score uppercase">
                What you may gain
              </p>
              <ul className="mt-3 space-y-2">
                {block.gains.map((g) => (
                  <li key={g} className="text-[13px] text-foreground">
                    · {g}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border bg-white px-4 py-4">
              <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
                What you may give up
              </p>
              <ul className="mt-3 space-y-2">
                {block.giveUps.map((g) => (
                  <li key={g} className="text-[13px] text-muted">
                    · {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {block.footnote && (
            <p className="mt-3 text-[12px] text-subtle">{block.footnote}</p>
          )}
        </GuideSection>
      );

    case "decision-flow":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <ol className="mt-5 space-y-3">
            {block.steps.map((step, i) => (
              <li
                key={step.id}
                className="flex gap-3 border border-border bg-white px-4 py-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14px] font-bold">{step.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {block.branches && (
            <div className="mt-6 border border-border bg-[#f7f7f5] px-4 py-4">
              <p className="text-[14px] font-bold">{block.branches.question}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {block.branches.options.map((o) => (
                  <li key={o.label} className="bg-white px-3 py-3 border border-border">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-accent-ink">
                      {o.label}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">{o.result}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GuideSection>
      );

    case "product-examples":
      return (
        <GuideSection id={block.id}>
          {heading}
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted">
            {block.disclaimer}
          </p>
          <ul className="mt-6 space-y-6">
            {block.examples.map((ex) => {
              const card = data.productExamples.find(
                (p) => p.product.id === ex.productId,
              );
              if (!card) return null;
              return (
                <li key={ex.productId}>
                  <ProductExampleCard card={card} example={ex} />
                </li>
              );
            })}
          </ul>
        </GuideSection>
      );

    case "product-comparison":
      return (
        <GuideSection id={block.id}>
          {heading}
          <StabilityComparisonTable data={data} productIds={block.productIds} />
          <div className="mt-5 flex flex-wrap gap-3">
            {block.bestGuideHref && (
              <Link
                href={block.bestGuideHref}
                className="inline-flex h-10 items-center bg-accent px-4 text-[12px] font-bold uppercase tracking-wide text-accent-foreground"
              >
                {block.bestGuideLabel ?? "Best guide →"}
              </Link>
            )}
            {block.compareHref && (
              <Link
                href={block.compareHref}
                className="inline-flex h-10 items-center border border-border px-4 text-[12px] font-bold uppercase tracking-wide"
              >
                Compare stability shoes →
              </Link>
            )}
          </div>
        </GuideSection>
      );

    case "mistakes":
      return (
        <GuideSection id={block.id}>
          {heading}
          <BlockDiagram diagram={block.diagram} />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {block.mistakes.map((m) => (
              <li
                key={m.id}
                className="border-l-2 border-accent bg-white px-4 py-3 border border-border"
              >
                <p className="text-[14px] font-bold">{m.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  {m.body}
                </p>
              </li>
            ))}
          </ul>
        </GuideSection>
      );

    case "diagram":
      return (
        <GuideSection id={block.id}>
          {heading}
          <ConceptDiagram variant={block.variant} caption={block.caption} />
        </GuideSection>
      );

    case "cta":
      return (
        <aside
          id={block.id}
          className={`scroll-mt-28 px-5 py-6 sm:px-6 ${
            block.variant === "finder"
              ? "bg-charcoal-950 text-white"
              : "border border-border bg-[#f7f7f5]"
          }`}
        >
          <p
            className={`font-display text-xl font-bold ${
              block.variant === "finder" ? "text-white" : "text-foreground"
            }`}
          >
            {block.title}
          </p>
          <p
            className={`mt-2 max-w-2xl text-[14px] leading-relaxed ${
              block.variant === "finder" ? "text-white/70" : "text-muted"
            }`}
          >
            {block.body}
          </p>
          <Link
            href={block.href}
            className={`mt-4 inline-flex h-10 items-center px-4 text-[12px] font-bold uppercase tracking-wide ${
              block.variant === "finder"
                ? "bg-accent text-accent-foreground"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {block.ctaLabel}
          </Link>
        </aside>
      );

    default:
      return null;
  }
}

function ComparisonVisualSummary({
  columns,
  rows,
}: {
  columns: string[];
  rows: { label: string; values: string[] }[];
}) {
  // Prefer the first two option columns when a third is a decision column
  const optionCount = Math.min(2, columns.length);
  const highlightRows = rows.slice(0, 3);

  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {columns.slice(0, optionCount).map((col, colIndex) => (
        <li key={col} className="border border-border bg-white px-4 py-4">
          <p className="text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">
            Option
          </p>
          <p className="mt-1 text-[15px] font-bold text-foreground">{col}</p>
          <ul className="mt-3 space-y-2">
            {highlightRows.map((row) => (
              <li key={`${col}-${row.label}`}>
                <p className="text-[10px] font-bold tracking-wide text-subtle uppercase">
                  {row.label}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">
                  {row.values[colIndex] ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function ProductExampleCard({
  card,
  example,
}: {
  card: GuideProductCardData;
  example: {
    approachLabel: string;
    whyIllustrates: string;
    bestFor: string[];
    tradeoff: string;
  };
}) {
  const fullName = card.brand?.name
    ? `${card.brand.name} ${card.product.name}`
    : card.product.name;

  return (
    <article className="grid gap-5 border border-border bg-white p-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:p-5">
      <div>
        <p className="text-[10px] font-bold tracking-wide text-accent-ink uppercase">
          {example.approachLabel}
        </p>
        <div className="relative mt-2 aspect-[4/3] bg-surface-muted/40">
          {card.media ? (
            <Image
              src={card.media.src}
              alt={card.media.alt ?? fullName}
              fill
              className="object-contain p-2"
              sizes="160px"
            />
          ) : null}
        </div>
        {typeof card.score === "number" && (
          <p className="mt-2 text-[12px] tabular-nums">
            <span className="inline-flex rounded-[3px] bg-score px-1.5 py-0.5 text-[11px] font-bold text-score-foreground">
              {displayScore(card.score)}
            </span>{" "}
            <span className="text-muted">Kitletics Score</span>
          </p>
        )}
      </div>
      <div>
        <h3 className="font-display text-xl font-bold">
          <Link
            href={`/products/${card.product.slug}`}
            className="hover:text-link"
          >
            {fullName}
          </Link>
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            Why it illustrates the category:{" "}
          </span>
          {example.whyIllustrates}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold tracking-wide text-subtle uppercase">
              Best for
            </p>
            <ul className="mt-1 space-y-1">
              {example.bestFor.map((b) => (
                <li key={b} className="text-[13px] text-foreground">
                  · {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-subtle uppercase">
              Trade-off
            </p>
            <p className="mt-1 text-[13px] text-muted">{example.tradeoff}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {card.reviewSlug ? (
            <Link
              href={`/reviews/${card.reviewSlug}`}
              className="text-[13px] font-medium text-link hover:underline"
            >
              Read review →
            </Link>
          ) : (
            <Link
              href={`/products/${card.product.slug}`}
              className="text-[13px] font-medium text-link hover:underline"
            >
              View product →
            </Link>
          )}
          <AddToCompareButton
            product={{
              slug: card.product.slug,
              name: card.product.name,
              brandName: card.brand?.name,
              categoryId: card.product.categoryId,
              categorySlug: "running-shoes",
            }}
            source="buying-guide"
            size="sm"
            variant="outline"
          />
          {card.price && (
            <span className="text-[13px] tabular-nums text-muted">
              From {formatPrice(card.price.price, card.price.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function StabilityComparisonTable({
  data,
  productIds,
}: {
  data: LongFormGuidePageData;
  productIds: string[];
}) {
  const rows = productIds
    .map((id) => data.productExamples.find((p) => p.product.id === id))
    .filter((p): p is GuideProductCardData => Boolean(p));

  if (rows.length === 0) return null;

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-border">
            {[
              "Product",
              "Support approach",
              "Cushion",
              "Drop",
              "Widths",
              "Best use",
              "Key trade-off",
            ].map((h) => (
              <th key={h} className="py-2 px-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const specs = row.product.specifications as Record<string, unknown>;
            const widths = Array.isArray(specs.widthOptions)
              ? (specs.widthOptions as string[]).join(", ")
              : "—";
            const midsole =
              typeof specs.midsole === "string" ? specs.midsole : "—";
            const cushion =
              typeof specs.cushionLevel === "string"
                ? specs.cushionLevel
                : "—";
            const drop =
              typeof specs.drop === "number" ? `${specs.drop} mm` : "—";
            const stability =
              typeof specs.stability === "string" ? specs.stability : "—";
            const tradeoff = row.product.weaknesses?.[0] ?? "—";
            const bestUse = row.roleLabel ?? "Daily / easy";
            return (
              <tr key={row.product.id} className="border-b border-border/70 align-top">
                <td className="py-3 px-2 font-medium">
                  <div className="flex gap-3">
                    {row.media?.src && (
                      <div className="relative size-14 shrink-0 bg-surface-muted/40">
                        <Image
                          src={row.media.src}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/products/${row.product.slug}`}
                        className="hover:text-link"
                      >
                        {row.brand?.name} {row.product.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] font-normal text-subtle">
                        {stability}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-muted">{midsole}</td>
                <td className="py-3 px-2 text-muted capitalize">{cushion}</td>
                <td className="py-3 px-2 text-muted">{drop}</td>
                <td className="py-3 px-2 text-muted capitalize">{widths}</td>
                <td className="py-3 px-2 text-muted">{bestUse}</td>
                <td className="py-3 px-2 text-muted">{tradeoff}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
