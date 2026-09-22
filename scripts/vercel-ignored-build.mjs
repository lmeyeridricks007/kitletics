#!/usr/bin/env node
/**
 * Vercel Ignored Build Step for Kitletics.
 *
 * Wired from vercel.json `ignoreCommand`.
 *
 * Official semantics (https://vercel.com/docs/project-configuration/vercel-json):
 *   exit 0 → skip the deployment (Canceled)
 *   exit 1 → proceed with the build
 *
 * This command runs on Vercel **before** `npm install`, so it must use only
 * Node.js built-ins (no tsx, no node_modules).
 *
 * Why not a generic git pathspec that excludes docs and every markdown file?
 *   1. HEAD^ is only the previous commit, not the previous deployment.
 *      A docs-only tip on top of app commits would skip incorrectly.
 *   2. This repo reads JSON/CSV under docs/padel/data and docs/quality/data
 *      at runtime. A blanket docs/ exclusion would skip those too.
 *   3. Shallow clones and first deployments have no parent — fail-open.
 */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXIT_BUILD,
  EXIT_SKIP,
  classifyChangedFiles,
} from "./lib/vercel-ignored-build.mjs";

function arg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFail) return "";
    throw error;
  }
}

function gitExists(rev) {
  if (!rev) return false;
  const out = git(["rev-parse", "--verify", `${rev}^{commit}`], { allowFail: true });
  return Boolean(out);
}

function parseFilesArg(raw) {
  if (!raw) return null;
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveRange(env) {
  const toArg = arg("to");
  const fromArg = arg("from");
  const to = toArg || env.VERCEL_GIT_COMMIT_SHA || "HEAD";

  const candidates = [];
  if (fromArg) candidates.push({ sha: fromArg, source: "--from" });
  if (env.VERCEL_GIT_PREVIOUS_SHA) {
    candidates.push({
      sha: env.VERCEL_GIT_PREVIOUS_SHA,
      source: "VERCEL_GIT_PREVIOUS_SHA",
    });
  }
  candidates.push({ sha: "HEAD~1", source: "HEAD~1" });

  for (const candidate of candidates) {
    if (gitExists(candidate.sha) && gitExists(to)) {
      return { from: candidate.sha, to, source: candidate.source };
    }
  }

  return null;
}

function listChangedFiles(from, to) {
  const raw = execFileSync("git", ["diff", "-z", "--name-only", from, to], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return raw.split("\0").map((s) => s.trim()).filter(Boolean);
}

function printHelp() {
  console.log(`Kitletics Vercel ignored-build step

Exit codes (Vercel):
  0  skip deployment
  1  proceed with build

Usage:
  node scripts/vercel-ignored-build.mjs
  node scripts/vercel-ignored-build.mjs --from <sha> --to <sha>
  node scripts/vercel-ignored-build.mjs --files docs/foo.md,reports/bar.md
`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    process.exitCode = EXIT_BUILD;
    return;
  }

  const explicitFiles = parseFilesArg(arg("files"));
  let files;
  let rangeNote;

  if (explicitFiles) {
    files = explicitFiles;
    rangeNote = "--files";
  } else {
    const range = resolveRange(process.env);
    if (!range) {
      console.log(
        "⚙️  BUILD — no previous SHA (first deploy, shallow clone, or missing parent). Fail-open.",
      );
      process.exitCode = EXIT_BUILD;
      return;
    }
    try {
      files = listChangedFiles(range.from, range.to);
      rangeNote = `${range.source}: ${range.from} → ${range.to}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`⚙️  BUILD — git diff failed (${message}). Fail-open.`);
      process.exitCode = EXIT_BUILD;
      return;
    }
  }

  const decision = classifyChangedFiles(files);
  console.log(`Ignored build check · ${rangeNote}`);
  console.log(`Changed files: ${files.length} · affecting: ${decision.affecting.length} · ignorable: ${decision.ignorable.length}`);

  if (decision.affecting.length) {
    console.log("Affecting production (will build):");
    for (const file of decision.affecting.slice(0, 40)) console.log(`  - ${file}`);
    if (decision.affecting.length > 40) {
      console.log(`  … ${decision.affecting.length - 40} more`);
    }
    console.log("⚙️  BUILD — application-affecting changes present. exit 1");
    process.exitCode = EXIT_BUILD;
    return;
  }

  if (decision.ignorable.length) {
    console.log("Documentation / audit-only changes:");
    for (const file of decision.ignorable.slice(0, 40)) console.log(`  - ${file}`);
    if (decision.ignorable.length > 40) {
      console.log(`  … ${decision.ignorable.length - 40} more`);
    }
  }

  console.log("🛑  SKIP — no production-affecting files. exit 0");
  process.exitCode = EXIT_SKIP;
}

const invoked =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invoked) {
  main();
}
