import { getWorkspace } from "@/domain/growth/backlinks/service";
import { digitalPrPacketsFromIdeas } from "@/domain/growth/backlinks/digital-pr";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function DigitalPrPage() {
  const { sourceRequests, campaigns, researchIdeas } = getWorkspace();
  const packets = digitalPrPacketsFromIdeas(researchIdeas);
  const soon = [...sourceRequests].sort((a, b) =>
    (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"),
  );
  return (
    <div className="space-y-4">
      <Panel title="Campaigns">
        <ul className="space-y-2 text-sm">
          {campaigns.map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.name}</span> · {c.status} · {c.angle}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Source-request inbox">
        {soon.length === 0 ? (
          <p className="text-sm text-muted">
            Empty. Import HARO/Qwoted rows from Imports. Deadlines will highlight here.
          </p>
        ) : (
          <ul className="space-y-3">
            {soon.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{r.requestTitle}</span>
                  {r.deadline ? (
                    <span className="text-warning">Due {r.deadline}</span>
                  ) : null}
                </div>
                <p className="text-muted">{r.topic}</p>
                <p className="mt-1 text-xs">{r.suggestedResponseAngle}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Proven catalog findings (do not invent extras)">
        {packets.length === 0 ? (
          <p className="text-sm text-muted">
            No proven findings on the research board yet. Unpublished Market 2026
            numbers stay off-limits.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {packets.map((p) => (
              <li key={p.ideaId} className="rounded-xl border border-border p-3">
                <p className="font-medium">{p.finding}</p>
                <p className="mt-1 text-xs text-muted">
                  n={p.sampleSize} · coverage {p.coverage} · asset {p.recommendedSourceAssetId}
                </p>
                <p className="mt-1 text-xs">{p.caveat}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
