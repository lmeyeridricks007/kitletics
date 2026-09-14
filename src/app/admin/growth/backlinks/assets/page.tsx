import { getLinkableAssets } from "@/domain/growth/backlinks/assets";
import { OPPORTUNITY_ASSET_MATRIX } from "@/domain/growth/backlinks/matrix";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/admin/growth/BacklinkControls";

export default function AssetsPage() {
  const assets = getLinkableAssets();
  return (
    <div className="space-y-4">
    <Panel title="Opportunity → asset matrix">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Audience</th>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Avoid</th>
            </tr>
          </thead>
          <tbody>
            {OPPORTUNITY_ASSET_MATRIX.map((row) => (
              <tr key={row.audience} className="border-t border-border align-top">
                <td className="py-2 font-medium">{row.audience}</td>
                <td>{row.primary}</td>
                <td>{row.secondary}</td>
                <td className="text-muted">{row.avoid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
    <Panel title="Pages to promote (resolved from the live catalog)">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-2">Rank</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Linkability</th>
              <th>Status</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.assetId} className="border-t border-border">
                <td className="py-2">{a.promoteRank}</td>
                <td>
                  {a.title}
                  <div className="text-xs text-muted">
                    journalist {a.journalistFit} · community {a.communityFit}
                  </div>
                </td>
                <td>{a.assetType}</td>
                <td>{a.linkabilityScore}</td>
                <td>
                  <Badge variant={a.status === "live" ? "success" : "warning"}>
                    {a.status}
                  </Badge>
                </td>
                <td>
                  {a.url ? (
                    <code className="text-xs">{a.url}</code>
                  ) : (
                    <span className="text-xs text-muted">not shipped</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
    </div>
  );
}
