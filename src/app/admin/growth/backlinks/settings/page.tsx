import { getWorkspace, writesEnabled } from "@/domain/growth/backlinks/service";
import { DEFAULT_OUTREACH_SCORE_WEIGHTS, DEFAULT_SCORE_WEIGHTS } from "@/domain/growth/backlinks/types";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function SettingsPage() {
  const { settings } = getWorkspace();
  const w = settings.scoreWeights ?? DEFAULT_SCORE_WEIGHTS;
  const ow = settings.outreachScoreWeights ?? DEFAULT_OUTREACH_SCORE_WEIGHTS;
  return (
    <div className="space-y-4">
      <Panel title="Persistence">
        <p className="text-sm">
          Workspace file: <code>data/growth/backlinks/workspace.json</code>
        </p>
        <p className="mt-2 text-sm text-muted">
          Writes {writesEnabled() ? "enabled" : "disabled (read-only)"}. Production
          stays read-only unless <code>GROWTH_BACKLINKS_WRITES=1</code>. Seed lives in
          code; local JSON is gitignored.
        </p>
      </Panel>
      <Panel title="Score weights (editorial CRM — seed prospects)">
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          <li>Relevance {Math.round(w.relevance * 100)}%</li>
          <li>Authority {Math.round(w.authority * 100)}% (editorial, not DA)</li>
          <li>Asset fit {Math.round(w.assetFit * 100)}%</li>
          <li>Likelihood {Math.round(w.likelihood * 100)}%</li>
          <li>Editorial quality {Math.round(w.editorialQuality * 100)}%</li>
          <li>Relationship {Math.round(w.relationship * 100)}%</li>
        </ul>
      </Panel>
      <Panel title="Outreach-agent weights (forum / journalist rows)">
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          <li>Relevance {Math.round((ow.relevance ?? 0.25) * 100)}%</li>
          <li>Asset fit {Math.round((ow.assetFit ?? 0.2) * 100)}%</li>
          <li>Likelihood {Math.round((ow.likelihood ?? 0.15) * 100)}%</li>
          <li>Authority {Math.round((ow.authority ?? 0.15) * 100)}%</li>
          <li>Helpfulness {Math.round((ow.helpfulness ?? 0.15) * 100)}%</li>
          <li>Relationship {Math.round((ow.relationship ?? 0.1) * 100)}%</li>
        </ul>
        <p className="mt-2 text-xs text-muted">
          Spam risk is a penalty, not a positive weight. Seed prospects keep the
          editorial weights above.
        </p>
      </Panel>
      <Panel title="Follow-up">
        <p className="text-sm">
          Default {settings.followUpDays} days (clamped 5–7). Max follow-ups:{" "}
          {settings.maxFollowUps}. Declined / earned blocks further follow-up.
        </p>
      </Panel>
      <Panel title="Competitor domains (configurable)">
        <ul className="list-disc pl-5 text-sm">
          {settings.competitorDomains.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Panel>
      <Panel title="Access">
        <p className="text-sm text-muted">
          Set <code>ADMIN_GROWTH_SECRET</code> (required in production) and optional{" "}
          <code>ADMIN_GROWTH_USER</code> (default kitletics). Production without a
          secret returns 404. Public GA4/Ahrefs scripts do not load on /admin.
        </p>
      </Panel>
    </div>
  );
}
