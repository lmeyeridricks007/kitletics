import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";
import { Badge } from "@/components/ui/Badge";

export default function ResearchPage() {
  const { researchIdeas } = getWorkspace();
  return (
    <Panel title="Research ideas (findings only when the catalog can compute them)">
      <div className="grid gap-3 md:grid-cols-2">
        {researchIdeas.map((idea) => (
          <article key={idea.id} className="rounded-xl border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">{idea.headline}</h3>
              <Badge variant={idea.findingProven ? "success" : "muted"}>
                {idea.status}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted">{idea.datasetRequired}</p>
            {idea.coverage ? (
              <p className="mt-2 text-sm">{idea.coverage}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">No finding attached.</p>
            )}
            <p className="mt-2 text-xs text-muted">
              Newsworthiness {idea.newsworthiness} · {idea.targetPublications.join(", ")}
            </p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
