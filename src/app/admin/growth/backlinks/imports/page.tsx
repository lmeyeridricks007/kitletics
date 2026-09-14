import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";
import { ImportForm } from "./ImportForm";

export default function ImportsPage() {
  const { discoveryQueries } = getWorkspace();
  return (
    <div className="space-y-6">
      <Panel title="CSV import">
        <p className="mb-4 text-sm text-muted">
          Vendor DR/DA/traffic stay labeled as Ahrefs/Semrush/Moz/Majestic. Example.com
          emails are dropped. Nothing is auto-approved or auto-sent.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <ImportForm
            kind="competitors"
            title="Competitor backlinks"
            hint="Ahrefs / Semrush / Moz / Majestic export. Creates COMPETITOR_LINK_GAP candidates."
          />
          <ImportForm
            kind="prospects"
            title="Manual prospects / journalists"
            hint="Columns: name, domain, url, country, why, email (optional, must be real)."
          />
          <ImportForm
            kind="requests"
            title="Source requests"
            hint="HARO / Qwoted / Featured paste. Columns: title, journalist, publication, deadline, topic, platform."
          />
        </div>
      </Panel>
      <Panel title="Discovery queries (run these yourself — we do not scrape Google)">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {discoveryQueries.map((q) => (
            <li key={q.id}>
              <code>{q.query}</code>
              <span className="text-muted"> · {q.intent}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="Exports">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <a className="underline" href="/admin/growth/backlinks/export/priority.csv">
              Priority outreach
            </a>
          </li>
          <li>
            <a className="underline" href="/admin/growth/backlinks/export/prospects.csv">
              Prospect master
            </a>
          </li>
          <li>
            <a className="underline" href="/admin/growth/backlinks/export/campaigns.csv">
              Campaigns
            </a>
          </li>
          <li>
            <a className="underline" href="/admin/growth/backlinks/export/earned.csv">
              Earned links
            </a>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
