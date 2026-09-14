import { notFound } from "next/navigation";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { getAssetById } from "@/domain/growth/backlinks/assets";
import { draftOutreach } from "@/domain/growth/backlinks/outreach";
import { CopyTextButtons } from "@/components/admin/growth/CopyTextButtons";
import { kitleticsPublicUrl } from "@/domain/growth/backlinks/public-url";
import { isForumOpportunityType } from "@/domain/growth/backlinks/type-aliases";
import {
  OutreachButtons,
  Panel,
  ReviewButtons,
  RiskBadge,
  ScoreBadge,
} from "@/components/admin/growth/BacklinkControls";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ws = getWorkspace();
  const o = ws.opportunities.find((x) => x.id === id);
  if (!o) notFound();
  const asset = getAssetById(o.targetAssetId);
  const draft = asset
    ? draftOutreach({ opportunity: o, asset, publicationName: o.siteName })
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{o.siteName}</h2>
          <p className="text-sm text-muted">
            {o.domain} · {o.opportunityType} · {o.country}/{o.language}
          </p>
        </div>
        <div className="flex gap-2">
          <ScoreBadge score={o.overallScore} band={o.priority} />
          <RiskBadge risk={o.risk} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Why this site">
          <p className="text-sm">{o.whyThisSite}</p>
        </Panel>
        <Panel title="Why this asset">
          <p className="text-sm">{o.whyThisAsset}</p>
          <p className="mt-2 text-xs text-muted">
            {o.targetUrl ? o.targetUrl : "Planned — no public URL yet"}
          </p>
        </Panel>
        <Panel title="Why this angle">
          <p className="text-sm">{o.whyThisAngle}</p>
        </Panel>
        <Panel title="Evidence">
          <p className="text-sm">{o.evidence}</p>
          <p className="mt-2 text-xs text-muted">
            Metric source: {o.metricSource}
            {o.importedAuthority != null
              ? ` (imported ${o.importedAuthority})`
              : ""}
          </p>
        </Panel>
      </div>

      <Panel title="Score explanation">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {o.scoreReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Panel>

      {o.forumThread || isForumOpportunityType(o.opportunityType) ? (
        <Panel title="Forum draft (not posted)">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Community</dt>
              <dd>{o.forumThread?.community ?? o.siteName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Link recommendation</dt>
              <dd>{o.linkRecommendation ?? "UNKNOWN"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Rules</dt>
              <dd>{o.communityRulesStatus ?? "RULES_UNKNOWN"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Helpfulness / spam / fit</dt>
              <dd>
                {o.helpfulnessScore ?? "UNKNOWN"} / {o.spamRiskScore ?? "UNKNOWN"} /{" "}
                {o.communityFitScore ?? "UNKNOWN"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            {o.linkRecommendationReason ?? "No link decision stored."}
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
            {o.suggestedResponse ?? o.forumThread?.suggestedResponse ?? "UNKNOWN"}
          </pre>
          <p className="mt-3 text-sm">
            Next action: {o.nextAction ?? "Human review. Never auto-post."}
          </p>
        </Panel>
      ) : null}

      <Panel title="Risk">
        <ul className="list-disc pl-5 text-sm">
          {o.riskReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Manual review">
        <p className="mb-3 text-xs text-muted">
          Nothing is auto-approved. Contact:{" "}
          {o.contactEmail ?? "CONTACT_UNKNOWN"}
        </p>
        <ReviewButtons id={o.id} />
      </Panel>

      {draft && !isForumOpportunityType(o.opportunityType) ? (
        <Panel title="Outreach draft (not sent)">
          <p className="text-sm font-medium">{draft.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
            {draft.body}
          </pre>
          {draft.followUp ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
              {draft.followUp}
            </pre>
          ) : null}
          <p className="mt-2 text-xs text-muted">
            Promote: {o.publicAssetUrl || kitleticsPublicUrl(o.targetUrl)}
          </p>
          <div className="mt-3">
            <CopyTextButtons
              subject={draft.subject}
              message={draft.body}
              followUp={draft.followUp}
            />
          </div>
          <div className="mt-4">
            <OutreachButtons id={o.id} />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
