import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BacklinkWorkspace } from "./types";
import { buildSeedWorkspace } from "./seed";

export const WORKSPACE_REL = join("data", "growth", "backlinks", "workspace.json");

export function workspacePath(): string {
  return join(process.cwd(), WORKSPACE_REL);
}

export function writesEnabled(): boolean {
  if (process.env.GROWTH_BACKLINKS_WRITES === "0") return false;
  if (process.env.GROWTH_BACKLINKS_WRITES === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function loadWorkspace(): BacklinkWorkspace {
  const path = workspacePath();
  if (!existsSync(path)) {
    const seed = buildSeedWorkspace();
    if (writesEnabled()) saveWorkspace(seed);
    return seed;
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as BacklinkWorkspace;
  if (raw.version !== 1 || !Array.isArray(raw.opportunities)) {
    return buildSeedWorkspace();
  }
  return raw;
}

export function saveWorkspace(workspace: BacklinkWorkspace): void {
  if (!writesEnabled()) {
    throw new Error(
      "Growth workspace is read-only here. Export JSON/CSV and commit locally (data/growth/backlinks/workspace.json).",
    );
  }
  const path = workspacePath();
  mkdirSync(join(process.cwd(), "data", "growth", "backlinks"), { recursive: true });
  const next = { ...workspace, updatedAt: new Date().toISOString() };
  writeFileSync(path, JSON.stringify(next, null, 2), "utf8");
}
