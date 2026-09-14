import { getWorkspace } from "@/domain/growth/backlinks/service";
import {
  buildActionQueue,
  resolvedAssetUrl,
} from "@/domain/growth/backlinks/action-queue";
import { Panel } from "@/components/admin/growth/BacklinkControls";
import { CopyTextButtons } from "@/components/admin/growth/CopyTextButtons";
import type { BacklinkOpportunity, CommunityPolicy } from "@/domain/growth/backlinks/types";

function ForumCards({
  title,
  rows,
  communities,
}: {
  title: string;
  rows: BacklinkOpportunity[];
  communities: CommunityPolicy[];
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">None in this bucket.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((o) => {
            const thread = o.forumThread;
            const rules = communities.find((c) => c.id === o.communityId)?.rulesUrl;
            const reply = o.suggestedResponse || thread?.suggestedResponse || "";
            return (
              <article
                key={o.id}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <p className="text-xs text-muted">
                  {thread?.community ?? o.siteName} · age {thread?.threadDate ?? "UNKNOWN"} ·{" "}
                  {o.linkRecommendation ?? "NO_LINK"}
                </p>
                <h3 className="font-display text-lg font-semibold">
                  {thread?.thread ?? o.topic}
                </h3>
                <p className="mt-1 text-sm">{o.evidence}</p>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
                  {reply}
                </pre>
                <p className="mt-2 text-xs text-muted">
                  Kitletics asset (only after rules are KNOWN): {resolvedAssetUrl(o)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm text-accent-foreground"
                    href={o.url}
                  >
                    Open thread
                  </a>
                  {rules ? (
                    <a
                      className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm"
                      href={rules}
                    >
                      Open rules
                    </a>
                  ) : null}
                  <CopyTextButtons response={reply} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export default function CommunityResponsePage() {
  const ws = getWorkspace();
  const queue = buildActionQueue(ws);
  const communities = ws.communities ?? [];
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Never auto-post. RULES_UNKNOWN means the reply is ready but the Kitletics
        URL must stay out. RESPOND TODAY is empty unless thread age is verified
        under 24h.
      </p>
      <ForumCards title="Respond today" rows={queue.respondToday} communities={communities} />
      <ForumCards title="Respond this week" rows={queue.respondThisWeek} communities={communities} />
      <ForumCards title="Monitor" rows={queue.monitor} communities={communities} />
      <ForumCards title="Skip" rows={queue.skip} communities={communities} />
    </div>
  );
}
