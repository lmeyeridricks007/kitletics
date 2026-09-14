import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function JournalistsPage() {
  const { journalists } = getWorkspace();
  return (
    <div className="space-y-4">
      <Panel title="Source platforms (manual — no scraping)">
        <ul className="flex flex-wrap gap-2 text-sm">
          {["HARO", "Qwoted", "Featured", "SourceBottle", "Source of Sources"].map(
            (n) => (
              <li key={n} className="rounded-lg border border-border px-3 py-1">
                {n}
              </li>
            ),
          )}
        </ul>
      </Panel>
      <Panel title="Journalist ledger">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-2">Name</th>
                <th>Publication</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Relationship</th>
              </tr>
            </thead>
            <tbody>
              {journalists.map((j) => (
                <tr key={j.id} className="border-t border-border">
                  <td className="py-2">{j.name}</td>
                  <td>{j.publication}</td>
                  <td>{j.role}</td>
                  <td>{j.contactStatus}</td>
                  <td>{j.relationshipStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
