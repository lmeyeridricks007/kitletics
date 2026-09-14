import Link from "next/link";
import { filterOpportunities, getWorkspace } from "@/domain/growth/backlinks/service";
import { OPPORTUNITY_TYPES } from "@/domain/growth/backlinks/types";
import {
  RiskBadge,
  ScoreBadge,
} from "@/components/admin/growth/BacklinkControls";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const ws = getWorkspace();
  const rows = filterOpportunities(ws, {
    type: g("type"),
    country: g("country"),
    language: g("language"),
    sport: g("sport"),
    asset: g("asset"),
    status: g("status"),
    campaign: g("campaign"),
    minScore: g("minScore") ? Number(g("minScore")) : undefined,
    risk: g("risk"),
    contact: g("contact"),
    topic: g("topic"),
  }).sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2 text-sm">
        <select name="type" defaultValue={g("type") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={g("status") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All review states</option>
          {["CANDIDATE", "APPROVED", "DEFERRED", "REJECTED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select name="campaign" defaultValue={g("campaign") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All campaigns</option>
          {ws.campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="country" defaultValue={g("country") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All countries</option>
          {[...new Set(ws.opportunities.map((o) => o.country))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select name="language" defaultValue={g("language") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All languages</option>
          {[...new Set(ws.opportunities.map((o) => o.language))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select name="sport" defaultValue={g("sport") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All sports</option>
          {[...new Set(ws.opportunities.map((o) => o.sport))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select name="contact" defaultValue={g("contact") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">Any contact</option>
          <option value="yes">Has email</option>
          <option value="no">CONTACT_UNKNOWN</option>
        </select>
        <select name="asset" defaultValue={g("asset") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">All assets</option>
          {[...new Set(ws.opportunities.map((o) => o.targetAssetId))].map((id) => (
            <option key={id} value={id}>
              {id.replace(/^asset-/, "")}
            </option>
          ))}
        </select>
        <select name="risk" defaultValue={g("risk") ?? ""} className="rounded-lg border border-border bg-background px-2 py-1">
          <option value="">Any risk</option>
          {["SAFE", "REVIEW", "AVOID"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input
          name="topic"
          defaultValue={g("topic") ?? ""}
          placeholder="Topic"
          className="w-36 rounded-lg border border-border bg-background px-2 py-1"
        />
        <input
          name="minScore"
          defaultValue={g("minScore") ?? ""}
          placeholder="Min score"
          className="w-24 rounded-lg border border-border bg-background px-2 py-1"
        />
        <button className="rounded-lg border border-border px-3 py-1" type="submit">
          Filter
        </button>
        <a
          className="rounded-lg border border-border px-3 py-1"
          href="/admin/growth/backlinks/export/priority.csv"
        >
          Export priority CSV
        </a>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Site</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/growth/backlinks/opportunities/${o.id}`}
                    className="font-medium hover:text-accent-ink"
                  >
                    {o.siteName}
                  </Link>
                  <div className="text-xs text-muted">{o.domain}</div>
                </td>
                <td className="text-xs">{o.opportunityType}</td>
                <td className="text-xs">{o.targetUrl || "(planned)"}</td>
                <td>
                  <ScoreBadge score={o.overallScore} band={o.priority} />
                </td>
                <td>
                  <RiskBadge risk={o.risk} />
                </td>
                <td className="text-xs">
                  {o.status} / {o.outreachStatus.replace(/_/g, " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
