import Link from "next/link";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import {
  buildActionQueue,
  contactHref,
  nextActionLine,
  resolvedAssetUrl,
} from "@/domain/growth/backlinks/action-queue";
import { Panel, ScoreBadge } from "@/components/admin/growth/BacklinkControls";
import { CopyTextButtons } from "@/components/admin/growth/CopyTextButtons";

export default function BacklinksActionQueuePage() {
  const ws = getWorkspace();
  const queue = buildActionQueue(ws);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Ready to contact", queue.readyToContact.length],
          ["Do these today", queue.doTheseToday.length],
          ["Apply now", queue.applyNow.length],
          ["Forum replies ready", queue.forumResponsesReady.length],
          ["Needs contact research", queue.needsContactResearch.length],
          ["Not actionable", queue.notActionable.length],
          ["Named contacts", queue.namedContacts],
          ["Direct routes", queue.directRoutes],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <Panel title="Action queue — READY TO CONTACT">
        <p className="mb-3 text-sm text-muted">
          Dutch first. One owner per domain in this list. CONTACT_UNKNOWN is not
          here — see Needs contact research. Nothing is auto-sent.
        </p>
        <div className="space-y-4">
          {queue.doTheseToday.length === 0 ? (
            <p className="text-sm text-muted">No immediately sendable editorial routes.</p>
          ) : (
            queue.doTheseToday.map((o) => (
              <article
                key={o.id}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">
                      {o.priority} · {o.contactMethod} · {o.language.toUpperCase()}
                    </p>
                    <h3 className="font-display text-lg font-semibold">
                      <Link
                        href={`/admin/growth/backlinks/opportunities/${o.id}`}
                        className="hover:text-accent-ink"
                      >
                        {o.siteName}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted">
                      {o.contactName ?? "unnamed desk"}
                      {o.contactRole && o.contactRole !== "unknown"
                        ? ` · ${o.contactRole}`
                        : ""}
                    </p>
                  </div>
                  <ScoreBadge score={o.overallScore} band={o.priority} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Target article</dt>
                    <dd>
                      <a className="text-accent-ink hover:underline" href={o.url}>
                        {o.url}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Promote</dt>
                    <dd>
                      <a
                        className="text-accent-ink hover:underline"
                        href={resolvedAssetUrl(o)}
                      >
                        {resolvedAssetUrl(o)}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Action</dt>
                    <dd>{nextActionLine(o)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Follow-up</dt>
                    <dd>5–7 days after first send</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">{o.suggestedPlacement}</p>
                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
                  {o.outreachSubject}
                  {"\n\n"}
                  {o.outreachMessage}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm text-accent-foreground"
                    href={contactHref(o)}
                  >
                    Contact
                  </a>
                  <a
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm"
                    href={o.url}
                  >
                    Open target
                  </a>
                  <a
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm"
                    href={resolvedAssetUrl(o)}
                  >
                    Open Kitletics asset
                  </a>
                  <CopyTextButtons
                    subject={o.outreachSubject}
                    message={o.outreachMessage}
                    followUp={o.followUpMessage}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>

      <Panel title="Needs contact research">
        <p className="mb-2 text-sm text-muted">
          Stay in CRM. Not in Do these today. GrokBot should research these on
          the next run.
        </p>
        <ul className="divide-y divide-border text-sm">
          {queue.needsContactResearch.slice(0, 20).map((o) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 py-2">
              <Link href={`/admin/growth/backlinks/opportunities/${o.id}`}>
                {o.siteName}
              </Link>
              <span className="text-muted">{o.actionStatus ?? "CONTACT_RESEARCH"}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
