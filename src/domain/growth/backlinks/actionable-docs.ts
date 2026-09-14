import type { ActionQueueSnapshot } from "./action-queue";
import { nextActionLine, resolvedAssetUrl } from "./action-queue";
import type { BacklinkOpportunity } from "./types";

function csvCell(value: string | number | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function renderActionableQueueMarkdown(queue: ActionQueueSnapshot): string {
  const top = queue.doTheseToday.slice(0, 12);
  const blocks = top
    .map((o, i) => {
      return `## ${i + 1}. ${o.siteName}

Target:
${o.url}

Contact:
${o.contactName ?? "unnamed desk"}${o.contactRole && o.contactRole !== "unknown" ? ` (${o.contactRole})` : ""}

Contact here:
${o.contactEmail ? `${o.contactEmail}` : ""}
${o.contactUrl ?? ""}

Promote:
${resolvedAssetUrl(o)}

Why:
${o.whyTheyMightLink}

Placement:
${o.suggestedPlacement ?? ""}

Subject:
${o.outreachSubject ?? ""}

Send:
${o.outreachMessage ?? ""}

Follow-up (5–7 days):
${o.followUpMessage ?? ""}

When:
Now. ${nextActionLine(o)}
`;
    })
    .join("\n");

  return `# Actionable backlink queue

Generated from public contact research. Nothing is auto-sent. Do not invent emails.

| | |
| --- | --- |
| Ready to contact | ${queue.readyToContact.length} |
| Do these today (one per domain) | ${queue.doTheseToday.length} |
| Apply now | ${queue.applyNow.length} |
| Forum responses ready | ${queue.forumResponsesReady.length} |
| Needs contact research | ${queue.needsContactResearch.length} |
| Not actionable | ${queue.notActionable.length} |
| Named contacts | ${queue.namedContacts} |
| Direct routes | ${queue.directRoutes} |

${blocks}

## Needs contact research (not the action queue)

${queue.needsContactResearch
  .slice(0, 40)
  .map((o) => `- ${o.siteName} — ${o.url} — ${o.actionStatus ?? "CONTACT_RESEARCH"}`)
  .join("\n")}
`;
}

export function renderActionableQueueCsv(rows: BacklinkOpportunity[]): string {
  const headers = [
    "id",
    "priority",
    "publication",
    "person",
    "role",
    "targetUrl",
    "contactMethod",
    "contactEmail",
    "contactUrl",
    "contactSourceUrl",
    "verifiedAt",
    "kitleticsUrl",
    "placement",
    "subject",
    "message",
    "followUp",
    "nextAction",
    "actionStatus",
    "language",
  ];
  const body = rows.map((o) =>
    [
      o.id,
      o.priority,
      o.siteName,
      o.contactName ?? "",
      o.contactRole,
      o.url,
      o.contactMethod ?? "",
      o.contactEmail ?? "",
      o.contactUrl ?? "",
      o.contactSourceUrl ?? "",
      o.contactVerifiedAt ?? "",
      resolvedAssetUrl(o),
      o.suggestedPlacement ?? "",
      o.outreachSubject ?? "",
      o.outreachMessage ?? "",
      o.followUpMessage ?? "",
      nextActionLine(o),
      o.actionStatus ?? "",
      o.language,
    ]
      .map(csvCell)
      .join(","),
  );
  return [headers.join(","), ...body].join("\n") + "\n";
}

export function renderCommunityQueueMarkdown(queue: ActionQueueSnapshot): string {
  const section = (title: string, rows: BacklinkOpportunity[]) => {
    if (rows.length === 0) return `## ${title}\n\n_None._\n`;
    return `## ${title}\n\n${rows
      .map((o) => {
        const t = o.forumThread;
        return `### ${t?.community ?? o.siteName} — ${t?.thread ?? o.topic}

Thread:
${o.url}

Age:
${t?.threadDate ?? "UNKNOWN"}

Rules:
${t ? "Open the community rules URL before posting any Kitletics link." : ""}

Link decision:
${o.linkRecommendation ?? "NO_LINK"}

Kitletics URL (do not paste if NO_LINK):
${resolvedAssetUrl(o)}

Response:
${o.suggestedResponse || t?.suggestedResponse || ""}
`;
      })
      .join("\n")}`;
  };

  return `# Community response queue

Never auto-post. RULES_UNKNOWN ⇒ LINK = DO NOT INCLUDE. RESPOND TODAY requires a verified <24h thread.

| | |
| --- | --- |
| Respond today | ${queue.respondToday.length} |
| Respond this week | ${queue.respondThisWeek.length} |
| Monitor | ${queue.monitor.length} |
| Skip | ${queue.skip.length} |
| Forum responses ready | ${queue.forumResponsesReady.length} |

${section("RESPOND TODAY", queue.respondToday)}

${section("RESPOND THIS WEEK", queue.respondThisWeek)}

${section("MONITOR", queue.monitor)}

${section("SKIP", queue.skip)}
`;
}

export function renderCommunityQueueCsv(queue: ActionQueueSnapshot): string {
  const rows = [
    ...queue.respondToday.map((o) => ({ o, urgency: "RESPOND_TODAY" })),
    ...queue.respondThisWeek.map((o) => ({ o, urgency: "RESPOND_THIS_WEEK" })),
    ...queue.monitor.map((o) => ({ o, urgency: "MONITOR" })),
    ...queue.skip.map((o) => ({ o, urgency: "SKIP" })),
  ];
  const headers = [
    "id",
    "urgency",
    "community",
    "threadUrl",
    "threadTitle",
    "threadDate",
    "linkDecision",
    "kitleticsUrl",
    "response",
    "language",
  ];
  const body = rows.map(({ o, urgency }) =>
    [
      o.id,
      urgency,
      o.forumThread?.community ?? o.siteName,
      o.url,
      o.forumThread?.thread ?? o.topic,
      o.forumThread?.threadDate ?? "",
      o.linkRecommendation ?? "",
      resolvedAssetUrl(o),
      o.suggestedResponse || o.forumThread?.suggestedResponse || "",
      o.language,
    ]
      .map(csvCell)
      .join(","),
  );
  return [headers.join(","), ...body].join("\n") + "\n";
}
