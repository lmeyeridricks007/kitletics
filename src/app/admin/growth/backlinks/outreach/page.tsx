import Link from "next/link";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function OutreachPage() {
  const { opportunities, campaigns } = getWorkspace();
  const due = opportunities.filter(
    (o) =>
      o.outreachStatus === "follow_up_due" ||
      o.outreachStatus === "draft_ready" ||
      o.outreachStatus === "contacted",
  );
  return (
    <div className="space-y-4">
      <Panel title="Campaign boards">
        {campaigns.map((c) => (
          <div key={c.id} className="mb-4">
            <h3 className="font-medium">
              {c.name} · {c.status}
            </h3>
            <p className="text-xs text-muted">{c.audience}</p>
          </div>
        ))}
      </Panel>
      <Panel title="Active outreach">
        <ul className="divide-y divide-border text-sm">
          {due.map((o) => (
            <li key={o.id} className="py-2">
              <Link
                href={`/admin/growth/backlinks/opportunities/${o.id}`}
                className="font-medium hover:text-accent-ink"
              >
                {o.siteName}
              </Link>{" "}
              <span className="text-muted">{o.outreachStatus.replace(/_/g, " ")}</span>
            </li>
          ))}
          {due.length === 0 ? (
            <li className="text-muted">Nothing in motion. Approve a candidate first.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}
