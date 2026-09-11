import Link from "next/link";
import { TrustRow } from "@/components/home/TrustRow";
import { ToolsHero } from "@/components/tools-hub/ToolsHero";
import {
  ToolSection,
  FinderToolCard,
  ComparisonToolCard,
  PlannerToolCard,
  SportToolsCard,
  UpcomingToolsCard,
  HowWeComparePanel,
} from "@/components/tools-hub/ToolCards";
import type { ToolsHubData } from "@/lib/tools/get-tools-hub-data";

const SPORT_ICONS: Record<string, string> = {
  running: "Footprints",
  padel: "CircleDot",
  fitness: "Dumbbell",
  training: "Dumbbell",
  hyrox: "Activity",
  tennis: "CircleDot",
  cycling: "Activity",
  outdoors: "Activity",
  pickleball: "CircleDot",
  badminton: "CircleDot",
  squash: "CircleDot",
};

interface ToolsHubPageProps {
  data: ToolsHubData;
}

export function ToolsHubPage({ data }: ToolsHubPageProps) {
  const filtered =
    Boolean(data.filters.sportSlug) ||
    Boolean(data.filters.type) ||
    Boolean(data.filters.domain);

  return (
    <>
      <ToolsHero data={data} />

      {filtered && (
        <div className="border-b border-border bg-surface-muted py-3">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 text-[13px] sm:px-6 lg:px-8">
            <span className="font-medium text-muted">Filtered view</span>
            {data.filters.domain === "shoes" && (
              <span className="rounded border border-border bg-white px-2 py-0.5 text-foreground">
                Domain: shoes
              </span>
            )}
            {data.filters.sportSlug && (
              <span className="rounded border border-border bg-white px-2 py-0.5 text-foreground">
                Sport: {data.filters.sportSlug}
              </span>
            )}
            {data.filters.type && (
              <span className="rounded border border-border bg-white px-2 py-0.5 text-foreground">
                Type: {data.filters.type}
              </span>
            )}
            <Link href="/tools" className="font-semibold text-accent hover:underline">
              Clear filters
            </Link>
          </div>
        </div>
      )}

      {data.finders.length > 0 && (
        <ToolSection
          id="find"
          title="Find the right gear"
          description="Personalized finders that match gear to your needs."
          viewAllHref={data.viewAll.finders}
          viewAllLabel="View all finders"
        >
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 xl:grid-cols-4">
            {data.finders.map((card) => (
              <FinderToolCard key={card.tool.id} card={card} />
            ))}
          </div>
        </ToolSection>
      )}

      {data.compareTools.length > 0 && (
        <ToolSection
          id="compare"
          title="Compare with confidence"
          description="Side-by-side tools to understand products, generations and trade-offs."
          viewAllHref={data.viewAll.compare}
          viewAllLabel="View all comparison tools"
          muted
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.7fr)] lg:items-stretch">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.compareTools.map((card) => (
                <ComparisonToolCard key={card.tool.id} card={card} />
              ))}
            </div>
            <HowWeComparePanel
              title={data.howWeCompare.title}
              body={data.howWeCompare.body}
              methodologyHref={data.howWeCompare.methodologyHref}
            />
          </div>
        </ToolSection>
      )}

      {data.planBuildTools.length > 0 && (
        <ToolSection
          id="plan"
          title="Plan, build & optimize"
          description="Planning tools to build kits, rotations and performance plans."
          viewAllHref={data.viewAll.plan}
          viewAllLabel="View all planning tools"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.planBuildTools.map((card) => (
              <PlannerToolCard key={card.tool.id} card={card} />
            ))}
          </div>
        </ToolSection>
      )}

      {(data.sports.length > 0 || data.comingSoon.length > 0) && (
        <ToolSection
          id="by-sport"
          title="Tools by sport"
          description="Browse tools linked to each sport — counts reflect published tools only."
          muted
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {data.sports.map((s) => (
                <SportToolsCard
                  key={s.sport.id}
                  name={s.sport.name}
                  toolCount={s.toolCount}
                  href={s.href}
                  iconName={SPORT_ICONS[s.sport.slug]}
                />
              ))}
            </div>
            <UpcomingToolsCard
              tools={data.comingSoon}
              contactHref="/contact"
            />
          </div>
        </ToolSection>
      )}

      <TrustRow />
    </>
  );
}
