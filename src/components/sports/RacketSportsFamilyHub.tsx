import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { SportPageHeader } from "@/components/headers/PageHeaders";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getSportBySlug } from "@/repositories";
import { notFound } from "next/navigation";
import { sportHasPublicCatalog } from "@/lib/catalog/listable-products";

const RACKET_CHILD_SLUGS = [
  "padel",
  "tennis",
  "pickleball",
  "badminton",
  "squash",
] as const;

/**
 * Discovery hub for the Racket Sports family — choose a sport, then find gear.
 * Does not compete with /padel, /tennis, etc.
 */
export function RacketSportsFamilyHub() {
  const sport = getSportBySlug("racket");
  if (!sport) notFound();

  const children = RACKET_CHILD_SLUGS.map((slug) => getSportBySlug(slug)).filter(
    (s): s is NonNullable<typeof s> =>
      Boolean(s) && s!.contentStatus === "live",
  );

  const live = children.filter((s) => sportHasPublicCatalog(s.id));
  const soon = children.filter((s) => !sportHasPublicCatalog(s.id));

  return (
    <>
      <SportPageHeader
        breadcrumbs={resolveBreadcrumbs({ type: "sport", sportSlug: "racket" })}
        eyebrow="Sport family"
        title="Racket Sports"
        description="Choose your sport, then find equipment, compare rackets and use Finders — without a second competing catalog tree."
      />

      <Section
        eyebrow="Live now"
        title="Where do you play?"
        description="Padel is fully open. Other racket sports stay linked here as Soon until their catalogs are launch-ready."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-md"
            >
              <p className="text-xs font-medium tracking-wide text-accent uppercase">
                Live catalog
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                {s.name}
              </h3>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
              <p className="mt-4 text-sm font-medium text-accent">
                Explore {s.name} →
              </p>
            </Link>
          ))}
          {soon.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="rounded-xl border border-dashed border-border bg-surface/70 p-6 transition-all hover:border-accent"
            >
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Soon
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                {s.name}
              </h3>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
              <p className="mt-4 text-sm font-medium text-muted">
                Coming soon →
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {live.length > 0 ? (
        <Section
          muted
          eyebrow="Start here"
          title="Open a live sport hub"
          description="Deep catalog pages, Best picks and Finders stay on sports that are launch-ready."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {live.map((s) => (
              <Link
                key={s.id}
                href={`/${s.slug}`}
                className="rounded-xl border border-border bg-surface p-5 hover:border-accent"
              >
                <h3 className="font-display text-base font-semibold">
                  {s.name} hub
                </h3>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
