import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  renderInitialProspectsCsv,
  renderInitialProspectsMarkdown,
} from "@/domain/growth/backlinks/initial-queue-docs";
import { buildSeedWorkspace } from "@/domain/growth/backlinks/seed";
import { saveWorkspace, writesEnabled } from "@/domain/growth/backlinks/store";

const root = process.cwd();
const mdPath = join(root, "docs/growth/INITIAL-100-BACKLINK-PROSPECTS.md");
const csvPath = join(root, "docs/growth/data/INITIAL-100-BACKLINK-PROSPECTS.csv");

mkdirSync(join(root, "docs/growth/data"), { recursive: true });
writeFileSync(mdPath, renderInitialProspectsMarkdown(), "utf8");
writeFileSync(csvPath, renderInitialProspectsCsv(), "utf8");

if (writesEnabled()) {
  saveWorkspace(buildSeedWorkspace());
  console.log("Wrote growth workspace.json from seed.");
} else {
  console.log("Workspace writes disabled; seed still powers admin until a local workspace exists.");
}

console.log(`Wrote ${mdPath}`);
console.log(`Wrote ${csvPath}`);
