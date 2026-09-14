import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function CompetitorsPage() {
  const ws = getWorkspace();
  const gaps = ws.opportunities.filter((o) => o.sourceType === "competitor_gap");
  return (
    <div className="space-y-4">
      <Panel title="Configured competitor domains">
        <ul className="list-disc pl-5 text-sm">
          {ws.settings.competitorDomains.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Import an Ahrefs/Semrush/Moz/Majestic backlink CSV on Imports. Metrics stay
          labeled. Do not assume these sites should be pitched — they are gap sources.
        </p>
      </Panel>
      <Panel title={`Competitor link-gap opportunities (${gaps.length})`}>
        {gaps.length === 0 ? (
          <p className="text-sm text-muted">None imported yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {gaps.map((g) => (
              <li key={g.id}>
                {g.siteName} linked to {g.competitorTargetUrl ?? "competitor"} → pitch{" "}
                {g.targetUrl} ({g.competitorIntent})
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
