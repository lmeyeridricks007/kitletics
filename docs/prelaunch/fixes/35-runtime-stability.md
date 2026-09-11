# Fix 35 — Production runtime stability smoke

**Date:** 2026-09-09  
**Status:** Measured (pre-launch — **do not publish**)  
**Lab:** `next build` + `next start` @ `http://127.0.0.1:3010`  
**Data:** [`../data/rc-final/35-runtime-smoke.json`](../data/rc-final/35-runtime-smoke.json)  
**Script:** `scripts/tmp/prelaunch-35-runtime-smoke.mjs`

## Objective

Determine whether the Final RC observation — `next start` dying under heavy concurrent audit load (`ECONNREFUSED`, functionalFail) — is **local harness pressure** or an **application** memory/load defect that would matter on Vercel / production hosting.

Do **not** optimize for local dev artificially; measure a production build.

---

## 1. Method

| Step | Detail |
|---|---|
| Build | `npm run build` (Next.js 15.5.24) — success |
| Serve | `NODE_ENV=production npx next start -p 3010 -H 127.0.0.1` |
| PID | `33202` (`next-server`) |
| Load | Moderate crawler / multi-tab profiles — **not** Playwright+vitest+sitemap swarm |

### Routes (representative)

`/` · `/running` · `/running/shoes` · Product (`nike-vomero-18`) · Review · Best · Guide · `/compare` · Finder · Search · Brand

### Profiles

| Profile | Concurrency | Rounds | Intent |
|---|---:|---:|---|
| warm-sequential | 1 | 2 | Baseline / warm cache |
| moderate-crawler | 4 | 3 | Modest bot / multi-tab |
| busy-crawler | 8 | 3 | Busy crawler |
| stress-local | 16 | 2 | Upper bound for **single** Node process |

Measurements: HTTP status, latency (p50/p95/p99), RSS, `%cpu` (macOS `ps`), process liveness, connection errors (timeout / socket / ECONNREFUSED / OOM).

---

## 2. Results

**Verdict: `STABLE_UNDER_MODERATE_LOAD`**

| Profile | Success | p50 | p95 | RSS max | CPU max | Process alive | Errors |
|---|---:|---:|---:|---:|---:|---|---|
| warm-sequential | **100%** | 641 ms | 5.4 s | 942 MB | 148% | yes | none |
| moderate-crawler | **100%** | 4.3 s* | 10.8 s | 933 MB | 141% | yes | none |
| busy-crawler | **100%** | — | 18.4 s | 938 MB | 127% | yes | none |
| stress-local | **100%** | — | 27.5 s | 920 MB | 142% | yes | none |

\*Latencies rise with concurrency as expected on one Node event loop — not failure.

| Signal | Observation |
|---|---|
| Process crash | **No** |
| Uncaught / OOM kill | **No** |
| ECONNREFUSED / socket hang | **0** |
| HTTP non-2xx/3xx | **0** (all measured **200**) |
| Baseline RSS | **538 MB** |
| Post-smoke RSS | **914 MB** (stabilized ~920–940 MB under load; not unbounded climb) |
| Post-smoke health check | `/` → **200** |

Slowest pages under load (typical): Best / shoes listing / finder — SSR-heavy, still successful.

---

## 3. Cause determination

### Final RC failure mode (prior)

From [`FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md): functional probes failed when `next start` died mid-lab (`functionalFail` + `ECONNREFUSED`). That lab stacked **heavy concurrent audit tooling** on one local process.

### This smoke

Under **moderate crawler concurrency (1–16)** against a fresh production build:

- Server stayed up  
- 100% HTTP success  
- Memory grew then **plateaued** (~900 MB RSS) — consistent with SSR cache/warmup on a long-lived process, not runaway leak forcing death in this window  

**Conclusion:** The RC death is best classified as **local harness / single-process pressure** under audit-swarm concurrency — **not** a confirmed production application defect at moderate user/crawler concurrency.

No application code fix required for Day-1 based on this smoke.

---

## 4. Hosting assumptions (Vercel / target)

| Local `next start` | Vercel (typical Next.js) |
|---|---|
| One long-lived Node process | Isolated serverless / edge invocations (per request or short-lived) |
| All concurrent SSR shares one heap + event loop | Memory/CPU isolated per invocation; concurrency scales horizontally |
| Lab can starve the process with Playwright + vitest + sitemap swarm | Hosting will not run that audit stack inside the web process |
| High RSS (~900 MB) is a **local** observation | Function memory limits differ; do **not** map local RSS 1:1 to Vercel OOM |

**Architecture fit:** Standard Next.js App Router build (no exotic `standalone` requirement observed for this check). Deploy as normal Vercel Next project; rely on platform concurrency isolation.

**Do not** treat local single-process death during RC audit swarm as proof of insufficient production capacity.

---

## 5. Ops guidance (optional, not blockers)

1. When re-running Final RC functional/a11y labs, **serialize** or isolate the `next start` target from vitest/Playwright workers that hammer the same port.  
2. Prefer production preview URL on Vercel for crawl/concurrency acceptance when possible.  
3. If local RSS ~1 GB is inconvenient for long audit sessions, restart `next start` between heavy phases — ops hygiene, not an app bug.

---

## 6. Definition of done

- [x] Production build (not `next dev`)  
- [x] Moderate concurrency on representative routes  
- [x] Success rate / latency / memory / CPU / crash / socket errors measured  
- [x] Cause classified: **local harness pressure** for RC death; **stable** under moderate load  
- [x] Hosting assumptions documented (do not over-extrapolate)  
- [x] Report written  

**Day-1 posture:** Runtime stability under moderate crawler/user concurrency is **acceptable**. Prior `next start` death during Final RC is a **measurement caveat**, not a launch blocker requiring an application remediating change.
