import { validateContactEmail } from "./risk";

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]!).map((h) => h.trim());
  const rows: CsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function csvEscape(value: string | number | boolean | undefined | null): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function serializeCsv(
  headers: string[],
  rows: ReadonlyArray<object>,
): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    const rec = row as Record<string, unknown>;
    lines.push(headers.map((h) => csvEscape(rec[h] as string | number | undefined)).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function pick(row: CsvRow, names: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const name of names) {
    const hit = keys.find((k) => k.trim().toLowerCase() === name.toLowerCase());
    if (hit && row[hit]?.trim()) return row[hit]!.trim();
  }
  return undefined;
}

export interface ImportedBacklinkRow {
  referringDomain: string;
  referringPage: string;
  targetPage?: string;
  anchor?: string;
  authority?: number;
  traffic?: number;
  firstSeen?: string;
  lastSeen?: string;
  linkType?: string;
  nofollow?: boolean;
  metricSource: "ahrefs" | "semrush" | "moz" | "majestic" | "manual_import";
}

export function detectMetricSource(headers: string[]): ImportedBacklinkRow["metricSource"] {
  const h = headers.join(" ").toLowerCase();
  if (h.includes("domain rating") || h.includes("ahrefs")) return "ahrefs";
  if (h.includes("authority score") || h.includes("semrush")) return "semrush";
  if (h.includes("domain authority") || h.includes("moz")) return "moz";
  if (h.includes("trust flow") || h.includes("citation flow") || h.includes("majestic")) {
    return "majestic";
  }
  return "manual_import";
}

export function mapImportedBacklinks(
  text: string,
  sourceHint?: ImportedBacklinkRow["metricSource"],
): ImportedBacklinkRow[] {
  const { headers, rows } = parseCsv(text);
  const metricSource = sourceHint ?? detectMetricSource(headers);
  const out: ImportedBacklinkRow[] = [];
  for (const row of rows) {
    const referringDomain = pick(row, [
      "referringDomain",
      "Referring domain",
      "Domain",
      "Root Domain",
      "root domain",
    ]);
    const referringPage = pick(row, [
      "referringPage",
      "Referring page",
      "Referring page URL",
      "Source URL",
      "Page URL",
      "URL",
    ]);
    if (!referringDomain && !referringPage) continue;
    const authorityRaw = pick(row, [
      "DR",
      "Domain Rating",
      "Domain Authority",
      "DA",
      "Authority Score",
      "Citation Flow",
    ]);
    const trafficRaw = pick(row, ["Organic traffic", "Traffic", "Domain traffic"]);
    const rel = pick(row, ["Nofollow", "Type", "Link type"]);
    out.push({
      referringDomain: (referringDomain ?? hostFromUrl(referringPage ?? "")).replace(/^www\./, ""),
      referringPage: referringPage ?? `https://${referringDomain}`,
      targetPage: pick(row, ["Target URL", "targetPage", "Link URL", "Destination"]),
      anchor: pick(row, ["Anchor", "Anchor text"]),
      authority: authorityRaw ? Number(authorityRaw) : undefined,
      traffic: trafficRaw ? Number(trafficRaw) : undefined,
      firstSeen: pick(row, ["First seen", "First Seen", "firstSeen"]),
      lastSeen: pick(row, ["Last seen", "Last Seen", "lastSeen"]),
      linkType: pick(row, ["Type", "Link type", "linkType"]),
      nofollow: /nofollow/i.test(rel ?? ""),
      metricSource,
    });
  }
  return out;
}

export function mapManualProspects(text: string): Array<{
  name: string;
  domain: string;
  homepageUrl: string;
  category?: string;
  country?: string;
  whyRelevant?: string;
  contactEmail?: string;
  contactStatus: "CONFIRMED" | "CONTACT_UNKNOWN";
}> {
  const { rows } = parseCsv(text);
  return rows
    .map((row) => {
      const domain = (
        pick(row, ["domain", "Domain", "website"]) ??
        hostFromUrl(pick(row, ["url", "URL", "homepage"]) ?? "")
      )
        .replace(/^www\./, "")
        .toLowerCase();
      if (!domain) return null;
      const email = pick(row, ["email", "contactEmail", "Email"]);
      const valid = validateContactEmail(email);
      return {
        name: pick(row, ["name", "Name", "site", "Site"]) ?? domain,
        domain,
        homepageUrl: pick(row, ["url", "URL", "homepage"]) ?? `https://${domain}`,
        category: pick(row, ["category", "Category"]),
        country: pick(row, ["country", "Country"]),
        whyRelevant: pick(row, ["why", "reason", "Why"]),
        contactEmail: valid.ok ? valid.email : undefined,
        contactStatus: valid.ok ? ("CONFIRMED" as const) : ("CONTACT_UNKNOWN" as const),
      };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
}

export function mapSourceRequests(text: string): Array<{
  requestTitle: string;
  journalist?: string;
  publication?: string;
  deadline?: string;
  topic: string;
  requirements: string;
  platform: string;
}> {
  const { rows } = parseCsv(text);
  return rows
    .map((row) => {
      const requestTitle = pick(row, ["title", "requestTitle", "Query", "Request"]);
      if (!requestTitle) return null;
      return {
        requestTitle,
        journalist: pick(row, ["journalist", "Journalist", "Name"]),
        publication: pick(row, ["publication", "Publication", "Outlet"]),
        deadline: pick(row, ["deadline", "Deadline"]),
        topic: pick(row, ["topic", "Topic"]) ?? requestTitle,
        requirements: pick(row, ["requirements", "Requirements", "Notes"]) ?? "",
        platform: pick(row, ["platform", "Platform"]) ?? "manual",
      };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  }
}

export function classifyCompetitorIntent(
  referringPage: string,
  anchor?: string,
  targetPage?: string,
): import("./types").CompetitorIntent {
  const blob = `${referringPage} ${anchor ?? ""} ${targetPage ?? ""}`.toLowerCase();
  if (/database|dataset|statistics|stack height|drop data/.test(blob)) return "data_citation";
  if (/resource|links|further reading/.test(blob)) return "resource_page";
  if (/vs |versus|compare/.test(blob)) return "comparison";
  if (/best |round.?up|shortlist/.test(blob)) return "roundup";
  if (/review/.test(blob)) return "review_citation";
  if (/finder|tool|calculator/.test(blob)) return "tool";
  if (/quote|expert/.test(blob)) return "expert_quote";
  if (/news|coverage/.test(blob)) return "news_coverage";
  if (/statistics|study|research/.test(blob)) return "statistics";
  return "unknown";
}

export function prospectKey(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}

export function isDuplicateProspect(
  existingDomains: string[],
  domain: string,
): boolean {
  const key = prospectKey(domain);
  return existingDomains.some((d) => prospectKey(d) === key);
}
