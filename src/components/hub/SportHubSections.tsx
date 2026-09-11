import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ButtonLink } from "@/components/ui/Button";
import type { SportHubData } from "@/lib/hubs/types";
import type { ProductSubcategory, UseCase, Discipline } from "@/domain/sports/types";

export function LookingForSection({ data }: { data: SportHubData }) {
  const { primaryCategories, categoryHrefs, categoryCounts, sport } = data;
  if (primaryCategories.length === 0) return null;

  return (
    <Section
      eyebrow="Gear"
      title="What are you looking for?"
      description="Start with the equipment decision that matters most — then refine by use case."
      action={
        <Link
          href={`/gear?sport=${sport.slug}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          View all {sport.name} gear →
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            href={categoryHrefs[category.id]}
            productCount={categoryCounts[category.id]}
            featured={category.slug === "running-shoes"}
          />
        ))}
      </div>
    </Section>
  );
}

export function ShoeTypesSection({
  shoeTypes,
  sportSlug,
}: {
  shoeTypes: ProductSubcategory[];
  sportSlug: string;
}) {
  if (shoeTypes.length === 0) return null;

  return (
    <Section
      muted
      eyebrow="Running shoes"
      title="Find your running shoes"
      description="Browse by shoe type — each maps to real subcategory taxonomy."
      action={
        <Link
          href={`/${sportSlug}/shoes`}
          className="text-sm font-medium text-accent hover:underline"
        >
          All running shoes →
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shoeTypes.map((type) => (
          <Link
            key={type.id}
            href={`/${sportSlug}/shoes?type=${type.slug}`}
            className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
          >
            <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
              Shoe type
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-foreground group-hover:text-accent">
              {type.name}
            </h3>
            <p className="mt-2 text-sm text-muted">{type.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-accent">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function UseCaseCardsSection({
  useCases,
}: {
  useCases: (UseCase & { href: string })[];
}) {
  if (useCases.length === 0) return null;

  return (
    <Section
      eyebrow="Use cases"
      title="Find shoes for how you run"
      description="Jump to setups and shortlists mapped to runner profiles and race goals."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <Link
            key={uc.id}
            href={uc.href}
            className="rounded-2xl border border-border bg-surface px-4 py-4 transition-colors hover:border-accent"
          >
            <h3 className="font-display text-base font-semibold text-foreground">
              {uc.name}
            </h3>
            <p className="mt-1.5 text-sm text-muted">{uc.description}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function DisciplineCardsSection({
  disciplines,
  sportSlug,
}: {
  disciplines: (Discipline & { gearCopy: string })[];
  sportSlug: string;
}) {
  if (disciplines.length === 0) return null;

  return (
    <Section
      muted
      eyebrow="Disciplines"
      title="How do you run?"
      description="Each discipline pulls a different gear mix — shoes, protection, hydration and watches."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {disciplines.map((d) => (
          <Link
            key={d.id}
            href={`/${sportSlug}/${d.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-md"
          >
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent">
              {d.name}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{d.gearCopy}</p>
            <span className="mt-4 text-sm font-medium text-accent">
              Explore {d.name.replace(/ Running$/, "")} →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function FinderCtaSection({ data }: { data: SportHubData }) {
  const { finder } = data.config;
  const href = `/tools/${finder.toolSlug}`;

  return (
    <Section>
      <div className="grid overflow-hidden rounded-3xl border border-border bg-charcoal-950 text-white lg:grid-cols-[1.2fr_0.8fr] dark:bg-charcoal-900">
        <div className="space-y-5 p-8 sm:p-10">
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            {finder.headline}
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {finder.title}
          </h2>
          <p className="max-w-xl text-base text-white/75">{finder.description}</p>
          <ButtonLink href={href} size="lg">
            {finder.ctaLabel}
          </ButtonLink>
        </div>
        {finder.preview && (
          <div className="flex items-center border-t border-white/10 bg-white/5 p-8 sm:p-10 lg:border-t-0 lg:border-l">
            <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium tracking-wide text-accent uppercase">
                {finder.preview.scoreLabel}
              </p>
              <p className="mt-3 font-display text-xl font-semibold">
                {finder.preview.productName}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {finder.preview.rationale}
              </p>
              <p className="mt-5 text-xs text-white/45">{finder.preview.note}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
