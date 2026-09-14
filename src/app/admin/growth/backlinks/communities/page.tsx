import Link from "next/link";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function CommunitiesPage() {
  const ws = getWorkspace();
  const communities = ws.communities ?? [];
  const history = ws.communityHistory ?? [];
  return (
    <div className="space-y-4">
      <Panel title="Community rules registry">
        <p className="mb-3 text-sm text-muted">
          Policy fields stay UNKNOWN until a human opens the rules URL. The agent
          never auto-posts. LINK_RECOMMENDED is blocked while rules are unknown.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="py-2 pr-3">Community</th>
                <th className="py-2 pr-3">Rules</th>
                <th className="py-2 pr-3">Self-promo</th>
                <th className="py-2 pr-3">Links</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {communities.map((c) => (
                <tr key={c.id} className="border-b border-border/70 align-top">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{c.community}</div>
                    <a
                      href={c.url}
                      className="text-xs text-accent-ink hover:underline"
                    >
                      {c.url}
                    </a>
                  </td>
                  <td className="py-2 pr-3">
                    <div>{c.rulesStatus}</div>
                    {c.rulesUrl ? (
                      <a
                        href={c.rulesUrl}
                        className="text-xs text-accent-ink hover:underline"
                      >
                        Open rules
                      </a>
                    ) : (
                      <span className="text-xs text-muted">UNKNOWN</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{c.selfPromotionPolicy}</td>
                  <td className="py-2 pr-3">{c.linkPolicy}</td>
                  <td className="py-2 text-xs text-muted">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Engagement history">
        {history.length === 0 ? (
          <p className="text-sm text-muted">
            Empty. Drafts are recorded when the outreach agent ingests a thread.
            Mark posted_human only after a person actually comments.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {history
              .slice()
              .reverse()
              .slice(0, 40)
              .map((h) => (
                <li key={h.id} className="py-2">
                  {h.at.slice(0, 10)} · {h.outcome} · {h.communityId}
                  {h.opportunityId ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        href={`/admin/growth/backlinks/opportunities/${h.opportunityId}`}
                        className="hover:text-accent-ink"
                      >
                        opportunity
                      </Link>
                    </>
                  ) : null}
                  {h.notes ? (
                    <span className="block text-xs text-muted">{h.notes}</span>
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
