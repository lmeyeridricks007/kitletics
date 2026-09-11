import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { SportHubData, RecentlyUpdatedItem } from "@/lib/hubs/types";

export function CompareSpotlightSection({ data }: { data: SportHubData }) {
  const { featuredComparison, comparisons, comparisonProductNames, config } =
    data;
  if (!featuredComparison && comparisons.length === 0) return null;

  return (
    <Section
      muted
      eyebrow="Compare"
      title="Compare running gear"
      description="See specs, strengths, trade-offs and who each product is best for."
      action={
        <Link
          href={`/compare?category=${config.compareCategorySlug}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Start a comparison →
        </Link>
      }
    >
      {featuredComparison && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr_auto]">
            <div className="rounded-2xl border border-border bg-surface-muted/60 p-5 text-center">
              <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                Product 1
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {featuredComparison.productNames[0]}
              </p>
            </div>
            <p className="text-center font-display text-sm font-semibold tracking-wide text-accent uppercase">
              vs
            </p>
            <div className="rounded-2xl border border-border bg-surface-muted/60 p-5 text-center">
              <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                Product 2
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {featuredComparison.productNames[1]}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <ButtonLink href={`/compare/${featuredComparison.comparison.slug}`}>
                Compare
              </ButtonLink>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm text-muted">
            {featuredComparison.comparison.summary}
          </p>
        </div>
      )}

      {comparisons.length > 0 && (
        <div>
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Featured comparisons
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {comparisons.map((comparison) => {
              const names = comparisonProductNames[comparison.id];
              return (
                <Link
                  key={comparison.id}
                  href={`/compare/${comparison.slug}`}
                  className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
                >
                  <Badge variant="muted">Comparison</Badge>
                  {names?.length === 2 ? (
                    <h4 className="mt-3 font-display text-base font-semibold leading-snug">
                      {names[0]}
                      <span className="mx-2 text-subtle">vs</span>
                      {names[1]}
                    </h4>
                  ) : (
                    <h4 className="mt-3 font-display text-base font-semibold">
                      {comparison.title}
                    </h4>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {comparison.summary}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

export function GearChecklistSection({ data }: { data: SportHubData }) {
  const { checklist } = data.config;
  const { categoryHrefs } = data;

  return (
    <Section
      eyebrow="Checklist"
      title="Running gear checklist"
      description="A navigational checklist — tap any item to open its category."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {checklist.map((group) => (
          <div key={group.group}>
            <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
              {group.group}
            </p>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => {
                const href = categoryHrefs[item.categoryId];
                if (!href) return null;
                if ((data.categoryCounts[item.categoryId] ?? 0) === 0) return null;
                return (
                  <li key={`${group.group}-${item.label}`}>
                    <Link
                      href={href}
                      className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-surface-muted hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ShoeEducationSection({ data }: { data: SportHubData }) {
  const { education } = data.config;

  return (
    <Section
      muted
      eyebrow="Decisions"
      title={education.title}
      description={education.description}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {education.dimensions.map((dim) => (
          <div
            key={dim.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
              {dim.label}
            </p>
            <p className="mt-2 text-sm text-muted">{dim.description}</p>
            <Link
              href={dim.href}
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              {dim.linkLabel}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function MethodologyModule() {
  return (
    <Section
      muted
      eyebrow="Trust"
      title="How Kitletics recommends gear"
      description="Recommendations are structured and explainable — not invented popularity contests."
      action={
        <Link
          href="/methodology"
          className="text-sm font-medium text-accent hover:underline"
        >
          Read our methodology →
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Structured specifications",
            body: "Products are compared using category-specific data — stack, drop, weight, features — not vibes alone.",
          },
          {
            title: "Use-case matching",
            body: "We evaluate products against specific runner needs: beginners, heavy runners, marathon blocks and more.",
          },
          {
            title: "Evidence, clearly labelled",
            body: "Testing, verified specifications, independent research and user feedback are distinguished — we do not claim every product is personally tested.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <h3 className="font-display text-base font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

const KIND_LABEL: Record<RecentlyUpdatedItem["kind"], string> = {
  "best-guide": "Best guide",
  comparison: "Comparison",
  review: "Review",
  "buying-guide": "Buying guide",
};

export function RecentlyUpdatedSection({
  items,
}: {
  items: RecentlyUpdatedItem[];
}) {
  if (items.length === 0) return null;

  return (
    <Section
      eyebrow="Freshness"
      title="Recently updated"
      description="Advice and comparisons that changed most recently — not a news feed."
    >
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <Badge variant="muted">{KIND_LABEL[item.kind]}</Badge>
              <p className="mt-2 font-display text-base font-semibold text-foreground">
                {item.title}
              </p>
              {item.summary && (
                <p className="mt-1 line-clamp-1 text-sm text-muted">
                  {item.summary}
                </p>
              )}
            </div>
            <time
              dateTime={item.updatedAt}
              className="shrink-0 text-xs text-subtle"
            >
              {new Date(item.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </Link>
        ))}
      </div>
    </Section>
  );
}
