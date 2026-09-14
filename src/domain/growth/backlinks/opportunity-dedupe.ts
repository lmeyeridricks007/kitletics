import type { BacklinkOpportunity } from "./types";
import { prospectKey } from "./csv";

const OPEN_OUTREACH = new Set([
  "contacted",
  "follow_up_due",
  "draft_ready",
  "responded",
  "interested",
]);

export function normalizeOpportunityUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    u.hash = "";
    u.hostname = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${u.hostname}${path}${u.search}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

export function opportunityFingerprint(input: {
  url: string;
  domain: string;
  opportunityType: string;
  targetAssetId: string;
}): string {
  return [
    normalizeOpportunityUrl(input.url),
    prospectKey(input.domain),
    input.opportunityType,
    input.targetAssetId,
  ].join("|");
}

export function isDuplicateOpportunity(
  existing: BacklinkOpportunity[],
  candidate: {
    url: string;
    domain: string;
    opportunityType: string;
    targetAssetId: string;
  },
): boolean {
  const url = normalizeOpportunityUrl(candidate.url);
  const domain = prospectKey(candidate.domain);
  for (const o of existing) {
    if (o.status === "REJECTED") continue;
    if (normalizeOpportunityUrl(o.url) === url) return true;
    if (
      prospectKey(o.domain) === domain &&
      o.opportunityType === candidate.opportunityType &&
      o.targetAssetId === candidate.targetAssetId
    ) {
      return true;
    }
    if (
      prospectKey(o.domain) === domain &&
      o.targetAssetId === candidate.targetAssetId &&
      OPEN_OUTREACH.has(o.outreachStatus)
    ) {
      return true;
    }
  }
  return false;
}
