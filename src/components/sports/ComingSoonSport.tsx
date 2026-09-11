import type { Sport } from "@/domain/sports/types";
import { PageHeader, StatusBadge } from "@/components/headers/PageHeaders";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { DiscoveryShortcuts } from "@/components/discovery/DiscoveryShortcuts";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { getDisciplinesBySport } from "@/repositories";

interface ComingSoonSportProps {
  sport: Sport;
}

export function ComingSoonSport({ sport }: ComingSoonSportProps) {
  const status =
    sport.contentStatus ?? (sport.available ? "live" : "coming-soon");
  const disciplines = getDisciplinesBySport(sport.id);

  return (
    <>
      <PageHeader
        breadcrumbs={resolveBreadcrumbs({
          type: "sport",
          sportSlug: sport.slug,
        })}
        eyebrow={sport.name}
        title={`Kitletics ${sport.name} is coming`}
        description={sport.description}
        badge={<StatusBadge status={status} />}
        actions={
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/running">Explore Running</ButtonLink>
            <ButtonLink href="/gear" variant="outline">
              Browse all gear
            </ButtonLink>
          </div>
        }
      />

      {disciplines.length > 0 && (
        <Section
          title="We’re structuring recommendations for"
          description="Disciplines already exist in the taxonomy — product depth arrives when this vertical goes live."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <p className="font-display font-semibold text-foreground">
                  {d.name}
                </p>
                <p className="mt-1 text-sm text-muted">{d.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section muted title="Keep exploring">
        <DiscoveryShortcuts
          items={[
            { label: "Running", href: "/running" },
            { label: "Gear", href: "/gear" },
            { label: "Finders", href: "/tools?type=finder" },
            { label: "Brands", href: "/brands" },
            { label: "Tools", href: "/tools" },
          ]}
        />
      </Section>
    </>
  );
}
