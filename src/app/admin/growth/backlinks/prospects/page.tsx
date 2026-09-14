import Link from "next/link";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function ProspectsPage() {
  const { prospects } = getWorkspace();
  return (
    <Panel title={`${prospects.length} prospects`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Name</th>
              <th>Category</th>
              <th>Market</th>
              <th>Contact</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr key={p.id} className="border-t border-border align-top">
                <td className="py-2">
                  <a href={p.homepageUrl} className="font-medium hover:text-accent-ink">
                    {p.name}
                  </a>
                  <div className="text-xs text-muted">{p.domain}</div>
                </td>
                <td>{p.category}</td>
                <td>
                  {p.country}/{p.language}
                </td>
                <td>{p.contactStatus}</td>
                <td className="max-w-sm text-muted">{p.whyRelevant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        No emails on seed rows.{" "}
        <Link href="/admin/growth/backlinks/imports" className="underline">
          Import a journalist list
        </Link>{" "}
        only with confirmed addresses.
      </p>
    </Panel>
  );
}
