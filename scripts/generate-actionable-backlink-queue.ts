import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getWorkspace } from "@/domain/growth/backlinks/service";
import { saveWorkspace, writesEnabled } from "@/domain/growth/backlinks/store";
import { buildActionQueue } from "@/domain/growth/backlinks/action-queue";
import {
  renderActionableQueueCsv,
  renderActionableQueueMarkdown,
  renderCommunityQueueCsv,
  renderCommunityQueueMarkdown,
} from "@/domain/growth/backlinks/actionable-docs";

const ws = getWorkspace();
const queue = buildActionQueue(ws);

const root = process.cwd();
mkdirSync(join(root, "docs/growth/data"), { recursive: true });
writeFileSync(
  join(root, "docs/growth/ACTIONABLE-BACKLINK-QUEUE.md"),
  renderActionableQueueMarkdown(queue),
  "utf8",
);
writeFileSync(
  join(root, "docs/growth/data/ACTIONABLE-BACKLINK-QUEUE.csv"),
  renderActionableQueueCsv(queue.readyToContact),
  "utf8",
);
writeFileSync(
  join(root, "docs/growth/COMMUNITY-RESPONSE-QUEUE.md"),
  renderCommunityQueueMarkdown(queue),
  "utf8",
);
writeFileSync(
  join(root, "docs/growth/data/COMMUNITY-RESPONSE-QUEUE.csv"),
  renderCommunityQueueCsv(queue),
  "utf8",
);

if (writesEnabled()) {
  saveWorkspace(ws);
}

console.log(
  JSON.stringify(
    {
      existingProspects: ws.prospects.length,
      opportunities: ws.opportunities.length,
      namedContacts: queue.namedContacts,
      directRoutes: queue.directRoutes,
      readyToContact: queue.readyToContact.length,
      doTheseToday: queue.doTheseToday.length,
      applyNow: queue.applyNow.length,
      forumResponsesReady: queue.forumResponsesReady.length,
      contactUnknown: queue.contactUnknown,
      needsContactResearch: queue.needsContactResearch.length,
      notActionable: queue.notActionable.length,
    },
    null,
    2,
  ),
);
