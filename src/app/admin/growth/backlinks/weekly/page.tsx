import Link from "next/link";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel, ScoreBadge } from "@/components/admin/growth/BacklinkControls";
import { WeeklyRunForm } from "./WeeklyRunForm";

export default function WeeklyBacklinksPage() {
  const ws = getWorkspace();
  const last = ws.weeklyRuns?.at(-1);
  const byId = new Map(ws.opportunities.map((o) => [o.id, o]));
  const cards = (ids: string[]) =>
    ids
      .map((id) => byId.get(id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

  return (
    <div className="space-y-6">
      <Panel title="This week">
        {last ? (
          <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <li>Ran {last.ranAt.slice(0, 16)}Z</li>
            <li>NEW MUST PURSUE {last.newMustPursueIds.length}</li>
            <li>NEW HIGH {last.newHighIds.length}</li>
            <li>FORUMS {last.forumToRespondIds?.length ?? 0}</li>
            <li>JOURNALIST DEADLINES {last.journalistDeadlineIds?.length ?? 0}</li>
            <li>FOLLOW-UP DUE {last.followUpDueIds.length}</li>
            <li>LINKS EARNED {last.earnedIds.length}</li>
            <li>EARNED MENTIONS {last.mentionIds?.length ?? 0}</li>
            <li>LINKS LOST {last.lostIds.length}</li>
            <li>Skipped duplicates {last.ingested.skippedDuplicates}</li>
          </ul>
        ) : (
          <p className="text-sm text-muted">
            No weekly run stored yet. Run below or{" "}
            <code>npm run growth:weekly</code>. Seed prospects are not listed as
            NEW.
          </p>
        )}
        <p className="mt-3 text-sm">
          Markdown:{" "}
          <code>docs/growth/WEEKLY-BACKLINK-REPORT.md</code>
        </p>
      </Panel>

      <Panel title="NEW HIGH / MUST PURSUE (last run)">
        {last && (last.newHighIds.length || last.newMustPursueIds.length) ? (
          <ul className="divide-y divide-border text-sm">
            {[...last.newMustPursueIds, ...last.newHighIds].map((id) => {
              const o = byId.get(id);
              if (!o) return null;
              return (
                <li key={id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link
                    href={`/admin/growth/backlinks/opportunities/${id}`}
                    className="font-medium hover:text-accent-ink"
                  >
                    {o.siteName}
                  </Link>
                  <ScoreBadge score={o.overallScore} band={o.priority} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">None this run.</p>
        )}
      </Panel>

      <Panel title="FOLLOW-UP DUE (last run snapshot)">
        {last && last.followUpDueIds.length ? (
          <ul className="list-disc pl-5 text-sm">
            {cards(last.followUpDueIds).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/growth/backlinks/opportunities/${o.id}`}>
                  {o.siteName}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">None.</p>
        )}
      </Panel>

      <Panel title="FORUMS TO RESPOND TO (open drafts)">
        {last && last.forumToRespondIds?.length ? (
          <ul className="list-disc pl-5 text-sm">
            {cards(last.forumToRespondIds).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/growth/backlinks/opportunities/${o.id}`}>
                  {o.siteName}
                </Link>
                {o.linkRecommendation ? ` · ${o.linkRecommendation}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            None queued. Ingest threads with{" "}
            <code>npm run growth:outreach -- --threads=file.json</code>. Never
            auto-posts.
          </p>
        )}
      </Panel>

      <Panel title="Run">
        <WeeklyRunForm />
      </Panel>
    </div>
  );
}
