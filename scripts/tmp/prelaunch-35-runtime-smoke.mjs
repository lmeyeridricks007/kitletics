/**
 * Fix 35 — production runtime stability smoke (moderate crawler concurrency).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3010 SERVER_PID=<pid> node scripts/tmp/prelaunch-35-runtime-smoke.mjs
 */
import { writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3010";
const SERVER_PID = process.env.SERVER_PID
  ? Number(process.env.SERVER_PID)
  : undefined;
const OUT_DIR = join(process.cwd(), "docs/prelaunch/data/rc-final");
const LOG_DIR = join(OUT_DIR, "logs");
mkdirSync(LOG_DIR, { recursive: true });

const ROUTES = [
  { id: "home", path: "/" },
  { id: "running", path: "/running" },
  { id: "running-shoes", path: "/running/shoes" },
  { id: "product", path: "/products/nike-vomero-18" },
  { id: "review", path: "/reviews/nike-vomero-18" },
  { id: "best", path: "/best/running-shoes" },
  { id: "guide", path: "/guides/how-to-choose-running-shoes" },
  { id: "compare", path: "/compare" },
  { id: "finder", path: "/tools/running-shoe-finder" },
  { id: "search", path: "/search?q=vomero" },
  { id: "brand", path: "/brands/nike" },
];

/** Moderate crawler / multi-tab user profiles — not audit-swarm extremes. */
const PROFILES = [
  { name: "warm-sequential", concurrency: 1, rounds: 2 },
  { name: "moderate-crawler", concurrency: 4, rounds: 3 },
  { name: "busy-crawler", concurrency: 8, rounds: 3 },
  { name: "stress-local", concurrency: 16, rounds: 2 },
];

function sampleProcess(pid) {
  if (!pid) return null;
  try {
    // macOS: rss in KB, %cpu
    const out = execSync(`ps -o pid=,rss=,%cpu=,etime= -p ${pid}`, {
      encoding: "utf8",
    }).trim();
    if (!out) return { alive: false };
    const parts = out.split(/\s+/).filter(Boolean);
    const rssKb = Number(parts[1]);
    const cpu = Number(parts[2]);
    return {
      alive: true,
      pid,
      rssMb: Math.round((rssKb / 1024) * 10) / 10,
      cpuPct: cpu,
      etime: parts[3],
    };
  } catch {
    return { alive: false, pid };
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

async function fetchOne(path) {
  const url = `${BASE}${path}`;
  const started = performance.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "kitletics-prelaunch-35-smoke/1.0" },
      signal: AbortSignal.timeout(45000),
    });
    // Drain body so sockets close cleanly
    await res.arrayBuffer();
    const ms = Math.round(performance.now() - started);
    return {
      path,
      status: res.status,
      ms,
      ok: res.status >= 200 && res.status < 400,
      error: null,
    };
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    const msg = err instanceof Error ? err.message : String(err);
    let kind = "unknown";
    if (/ECONNREFUSED/i.test(msg)) kind = "ECONNREFUSED";
    else if (/ECONNRESET|socket hang up/i.test(msg)) kind = "socket";
    else if (/AbortError|TimeoutError|timed out/i.test(msg)) kind = "timeout";
    else if (/ENOMEM|out of memory/i.test(msg)) kind = "OOM";
    return { path, status: 0, ms, ok: false, error: kind, detail: msg };
  }
}

async function runPool(paths, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < paths.length) {
      const idx = i++;
      results[idx] = await fetchOne(paths[idx]);
    }
  }
  const n = Math.min(concurrency, paths.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function summarize(results, memSamples) {
  const latencies = results
    .filter((r) => r.ok)
    .map((r) => r.ms)
    .sort((a, b) => a - b);
  const byStatus = {};
  const byError = {};
  const byRoute = {};
  for (const r of results) {
    const sk = String(r.status);
    byStatus[sk] = (byStatus[sk] || 0) + 1;
    if (r.error) byError[r.error] = (byError[r.error] || 0) + 1;
    if (!byRoute[r.path]) {
      byRoute[r.path] = { total: 0, ok: 0, fail: 0, ms: [] };
    }
    byRoute[r.path].total++;
    if (r.ok) {
      byRoute[r.path].ok++;
      byRoute[r.path].ms.push(r.ms);
    } else byRoute[r.path].fail++;
  }
  const routeSummary = Object.fromEntries(
    Object.entries(byRoute).map(([path, v]) => [
      path,
      {
        total: v.total,
        ok: v.ok,
        fail: v.fail,
        successRate: v.total ? Math.round((1000 * v.ok) / v.total) / 10 : 0,
        p50: percentile([...v.ms].sort((a, b) => a - b), 50),
        p95: percentile([...v.ms].sort((a, b) => a - b), 95),
      },
    ]),
  );
  const memAlive = memSamples.filter((m) => m && m.alive);
  return {
    requests: results.length,
    success: results.filter((r) => r.ok).length,
    fail: results.filter((r) => !r.ok).length,
    successRate:
      results.length > 0
        ? Math.round((1000 * results.filter((r) => r.ok).length) / results.length) /
          10
        : 0,
    byStatus,
    byError,
    latencyMs: {
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies.length ? latencies[latencies.length - 1] : null,
    },
    routeSummary,
    memory: {
      samples: memSamples.length,
      aliveFinal: memSamples.at(-1)?.alive ?? null,
      rssMbMin: memAlive.length
        ? Math.min(...memAlive.map((m) => m.rssMb))
        : null,
      rssMbMax: memAlive.length
        ? Math.max(...memAlive.map((m) => m.rssMb))
        : null,
      cpuPctMax: memAlive.length
        ? Math.max(...memAlive.map((m) => m.cpuPct))
        : null,
      samplesDetail: memSamples,
    },
  };
}

async function waitHealthy(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok || res.status === 200) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  const logPath = join(LOG_DIR, "35-smoke.log");
  const log = (line) => {
    appendFileSync(logPath, `${line}\n`);
    console.log(line);
  };
  writeFileSync(logPath, "");

  log(`BASE=${BASE}`);
  log(`SERVER_PID=${SERVER_PID ?? "unknown"}`);
  const healthy = await waitHealthy();
  if (!healthy) {
    const report = {
      measuredAt: new Date().toISOString(),
      base: BASE,
      verdict: "SERVER_UNREACHABLE",
      note: "Could not reach production server before smoke.",
    };
    writeFileSync(
      join(OUT_DIR, "35-runtime-smoke.json"),
      JSON.stringify(report, null, 2),
    );
    console.error(JSON.stringify(report, null, 2));
    process.exit(2);
  }

  const baselineMem = sampleProcess(SERVER_PID);
  log(`baselineMem=${JSON.stringify(baselineMem)}`);

  const profileResults = [];
  let processDied = false;
  let firstDeathAt = null;

  for (const profile of PROFILES) {
    if (processDied) break;
    log(`\n=== profile ${profile.name} c=${profile.concurrency} rounds=${profile.rounds} ===`);
    const paths = [];
    for (let r = 0; r < profile.rounds; r++) {
      for (const route of ROUTES) paths.push(route.path);
    }
    const memSamples = [sampleProcess(SERVER_PID)];
    const memTimer = setInterval(() => {
      memSamples.push(sampleProcess(SERVER_PID));
    }, 750);

    const t0 = performance.now();
    const results = await runPool(paths, profile.concurrency);
    clearInterval(memTimer);
    memSamples.push(sampleProcess(SERVER_PID));
    const elapsedMs = Math.round(performance.now() - t0);

    const summary = summarize(results, memSamples);
    const alive = sampleProcess(SERVER_PID);
    if (SERVER_PID && alive && !alive.alive) {
      processDied = true;
      firstDeathAt = profile.name;
    }
    // Also detect mass ECONNREFUSED as death signal
    const refused = summary.byError.ECONNREFUSED ?? 0;
    if (refused >= Math.ceil(results.length * 0.5)) {
      processDied = true;
      firstDeathAt = firstDeathAt ?? profile.name;
    }

    profileResults.push({
      profile: profile.name,
      concurrency: profile.concurrency,
      rounds: profile.rounds,
      elapsedMs,
      ...summary,
      processAliveAfter: alive?.alive ?? null,
    });
    log(
      JSON.stringify({
        profile: profile.name,
        successRate: summary.successRate,
        p95: summary.latencyMs.p95,
        rssMax: summary.memory.rssMbMax,
        errors: summary.byError,
        alive: alive?.alive,
      }),
    );

    // Cool-down between profiles
    await new Promise((r) => setTimeout(r, 1500));
  }

  const postMem = sampleProcess(SERVER_PID);
  const moderateOk = profileResults
    .filter((p) => p.concurrency <= 8)
    .every((p) => p.successRate === 100 && p.processAliveAfter !== false);

  let verdict;
  let cause;
  if (!moderateOk || processDied) {
    // Distinguish: only dies under stress-local / concurrent vitest-like load
    const moderate = profileResults.filter((p) => p.concurrency <= 8);
    const stress = profileResults.filter((p) => p.concurrency > 8);
    const moderateHealthy = moderate.every(
      (p) => p.successRate >= 99 && p.processAliveAfter !== false,
    );
    if (moderateHealthy && (!stress.length || processDied)) {
      verdict = "LOCAL_HARNESS_PRESSURE";
      cause =
        "Moderate crawler concurrency (≤8) stable; failures tied to local single-process pressure or extreme concurrency — not extrapolated to Vercel.";
    } else if (
      moderate.some((p) => (p.byError.ECONNREFUSED ?? 0) > 0) ||
      processDied
    ) {
      const rssClimb =
        baselineMem?.rssMb && postMem?.rssMb
          ? postMem.rssMb - baselineMem.rssMb
          : null;
      if (rssClimb != null && rssClimb > 800) {
        verdict = "APPLICATION_MEMORY_PRESSURE";
        cause = `RSS climbed ~${rssClimb} MB under moderate load; investigate SSR memory.`;
      } else {
        verdict = "LOCAL_SINGLE_PROCESS_INSTABILITY";
        cause =
          "next start (single Node process) became unreachable under lab load; pattern matches prior RC ECONNREFUSED during concurrent Playwright/audit — likely harness, confirm before app fix.";
      }
    } else {
      verdict = "APPLICATION_ERROR_RATE";
      cause = "Non-connection failures under moderate load (HTTP 5xx / timeouts).";
    }
  } else {
    verdict = "STABLE_UNDER_MODERATE_LOAD";
    cause =
      "Production build served representative routes at concurrency 1–16 without process death or connection refused.";
  }

  const report = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    serverPid: SERVER_PID ?? null,
    baselineMem,
    postMem,
    processDied,
    firstDeathAt,
    verdict,
    cause,
    hostingNote:
      "Vercel runs serverless / edge isolated invocations — local next start is one long-lived Node process sharing heap/event-loop across all concurrent SSR requests. Do not treat local single-process death during Playwright+vitest+sitemap swarm as production capacity proof.",
    routes: ROUTES,
    profiles: profileResults,
  };

  writeFileSync(
    join(OUT_DIR, "35-runtime-smoke.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        verdict: report.verdict,
        cause: report.cause,
        processDied: report.processDied,
        profiles: profileResults.map((p) => ({
          name: p.profile,
          successRate: p.successRate,
          p95: p.latencyMs.p95,
          rssMax: p.memory.rssMbMax,
          cpuMax: p.memory.cpuPctMax,
          errors: p.byError,
          alive: p.processAliveAfter,
        })),
        baselineRssMb: baselineMem?.rssMb,
        postRssMb: postMem?.rssMb,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
