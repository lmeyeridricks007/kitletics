import { getWorkspace } from "@/domain/growth/backlinks/service";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function EarnedPage() {
  const { earnedLinks } = getWorkspace();
  return (
    <Panel title="Earned links">
      {earnedLinks.length === 0 ? (
        <p className="text-sm text-muted">
          Empty until a human verifies a live URL. Also append{" "}
          <code>data/staging/site-quality/known-backlinks.json</code>.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Source</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {earnedLinks.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="py-2">{l.sourceUrl}</td>
                <td>{l.targetUrl}</td>
                <td>{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <a
        className="mt-3 inline-block text-sm underline"
        href="/admin/growth/backlinks/export/earned.csv"
      >
        Export earned CSV
      </a>
    </Panel>
  );
}
