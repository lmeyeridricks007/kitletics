import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { SportPageHeader } from "@/components/headers/PageHeaders";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getSports, getSportBySlug } from "@/repositories";
import { notFound } from "next/navigation";

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

  return (
    <>
      <SportPageHeader
        breadcrumbs={resolveBreadcrumbs({ type: "sport", sportSlug: "racket" })}
        eyebrow="Sport family"
        title="Racket Sports"
        description="Choose your sport, then find equipment, compare rackets and use Finders — without a second competing catalog tree."
      />

      <Section
        eyebrow="Choose your sport"
        title="Where do you play?"
        description="Padel and Tennis are deepest today. Pickleball, Badminton and Squash share the same Product architecture."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-md"
            >
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                {s.featured ? "Featured" : "Catalog"}
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
        </div>
      </Section>

      <Section
        muted
        eyebrow="Choose a sport"
        title="Start on a sport hub"
        description="Padel and Tennis hubs are live. Finders and deep catalog pages stay on those hubs when the vertical is open."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {children.slice(0, 2).map((s) => (
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
    </>
  );
}

void getSports;
