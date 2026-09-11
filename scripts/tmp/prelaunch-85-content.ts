import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { resetIssueCounters } from "@/domain/site-quality/issues";
import { auditContentQuality } from "@/domain/site-quality/audits/content";

resetIssueCounters();
const issues = auditContentQuality().filter((i) => i.id.startsWith("CONTENT-"));
const out = join(
  process.cwd(),
  process.env.CONTENT_AUDIT_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(out, { recursive: true });
const payload = issues.map((i) => ({
  id: i.id,
  severity: i.severity,
  evidence: i.evidence,
  status: i.status,
}));
writeFileSync(join(out, "content-audit-slice.json"), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
