import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import type {
  DiscoverySuppression,
  MaintenanceEvent,
  MaintenanceJobResult,
  MaintenanceTask,
} from "@/domain/freshness/types";

const ROOT = join(process.cwd(), "data", "staging", "maintenance");

export function maintenanceRoot(): string {
  return ROOT;
}

export function ensureMaintenanceDirs(): void {
  for (const sub of ["", "events", "tasks", "jobs", "suppressions", "locks"]) {
    mkdirSync(join(ROOT, sub), { recursive: true });
  }
  mkdirSync(join(process.cwd(), "reports", "maintenance"), { recursive: true });
}

export function saveTasks(tasks: MaintenanceTask[]): void {
  ensureMaintenanceDirs();
  writeFileSync(
    join(ROOT, "tasks", "queue.json"),
    JSON.stringify(tasks, null, 2),
    "utf8",
  );
}

export function loadTasks(): MaintenanceTask[] {
  const path = join(ROOT, "tasks", "queue.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8")) as MaintenanceTask[];
}

export function saveEvents(events: MaintenanceEvent[]): void {
  ensureMaintenanceDirs();
  writeFileSync(
    join(ROOT, "events", "latest.json"),
    JSON.stringify(events, null, 2),
    "utf8",
  );
}

export function loadEvents(): MaintenanceEvent[] {
  const path = join(ROOT, "events", "latest.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8")) as MaintenanceEvent[];
}

export function saveJob(result: MaintenanceJobResult): string {
  ensureMaintenanceDirs();
  const path = join(ROOT, "jobs", `${result.jobId}.json`);
  writeFileSync(path, JSON.stringify(result, null, 2), "utf8");
  return path;
}

export function saveReportMarkdown(jobId: string, markdown: string): string {
  ensureMaintenanceDirs();
  const path = join(
    process.cwd(),
    "reports",
    "maintenance",
    `${jobId}.md`,
  );
  writeFileSync(path, markdown, "utf8");
  return path;
}

export function loadSuppressions(): DiscoverySuppression[] {
  const path = join(ROOT, "suppressions", "list.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8")) as DiscoverySuppression[];
}

export function saveSuppressions(items: DiscoverySuppression[]): void {
  ensureMaintenanceDirs();
  writeFileSync(
    join(ROOT, "suppressions", "list.json"),
    JSON.stringify(items, null, 2),
    "utf8",
  );
}

export function isSuppressed(
  modelKey: string,
  brandId: string | undefined,
  now = new Date(),
): DiscoverySuppression | undefined {
  return loadSuppressions().find((s) => {
    if (s.status !== "active") return false;
    if (s.modelKey !== modelKey) return false;
    if (brandId && s.brandId && s.brandId !== brandId) return false;
    if (s.expiresAt && Date.parse(s.expiresAt) < now.getTime()) return false;
    return true;
  });
}

/** Simple job lock to avoid conflicting concurrent writers */
export function acquireLock(lockId: string, dryRun: boolean): boolean {
  if (dryRun) return true;
  ensureMaintenanceDirs();
  const path = join(ROOT, "locks", `${lockId}.lock`);
  if (existsSync(path)) {
    const raw = JSON.parse(readFileSync(path, "utf8")) as { at: string };
    const age = Date.now() - Date.parse(raw.at);
    if (age < 30 * 60 * 1000) return false;
  }
  writeFileSync(path, JSON.stringify({ at: new Date().toISOString() }), "utf8");
  return true;
}

export function releaseLock(lockId: string, dryRun: boolean): void {
  if (dryRun) return;
  const path = join(ROOT, "locks", `${lockId}.lock`);
  if (existsSync(path)) {
    writeFileSync(path, "", "utf8");
  }
}

export function listJobIds(): string[] {
  const dir = join(ROOT, "jobs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
