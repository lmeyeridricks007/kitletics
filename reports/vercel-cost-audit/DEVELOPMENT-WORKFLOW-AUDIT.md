# Development workflow / preview / build cost audit

Sep 1–17 **Build CPU Minutes $21.39 billed** — the **#1 line item**, larger than Fluid.

August builds were already $16.98. This is not a one-week anomaly; it is the default `main` → production loop, amplified by AI/Cursor commits and failed retries.

---

## Deployment facts (Vercel API `/v6/deployments`, latest 100)

| Project | Sep deploys | Targets | Failed | Avg build | Max | Build machine (dashboard) |
|---|---|---|---|---|---|---|
| kitletics | 19 | 16 prod / 3 preview | 2 | 266s | **740s** | **turbo** (`oom-failure`) |
| softwareglimpse | 7 | 7 prod | 1 | **647s** | **1218s** | **turbo** (`long-build-duration`) |
| hikingwithlee | 12 | 12 prod | 4 | 173s | 252s | enhanced (`short-build-duration`) |
| lifeos-expatlife-web | 8 | 8 prod | **4** | 278s | 339s | standard; Aug avg **950s** |
| fluentcopilot | 0 in Sep | last June | — | — | — | standard |

**Preview is not the problem.** Almost every billable build is **production on `main`**. HikingWithLee Sep refs: 12/12 `main`. Glimpse 7/7 `main`. Expat 8/8 `main`. Kitletics 16/19 `main`.

---

## Agent / commit amplification (HIGH)

Sample production commit messages:

- HikingWithLee: **7×** `vercel fix` in September.
- ExpatCopilot: `vercel fix again`, `vercel error`, `ahrefs fixes`.
- Kitletics: media Blob serve, padel launch merges, “Fix Vercel build by including admin…”.
- SoftwareGlimpse: estate remediation, CRM research, PRE-GROWTH baseline.

Cursor/agent loops that **push to `main` to see if Vercel compiles** pay full Build CPU. Failed builds still bill (Expat 50% ERROR in Sep; Hiking 4/12 ERROR).

**Rule:** `next build` locally (or CI) before push. Do not use Vercel as `tsc`.

---

## Missing ignored build step (HIGH)

| Project | `vercel.json` | `ignoreCommand` / `commandForIgnoringBuildStep` |
|---|---|---|
| kitletics | none | **null** in project API |
| softwareglimpse | none | none |
| hikingwithlee | redirects only | none |
| lifeos-expatlife-web | none (`VERCEL.md` documents dashboard) | none |
| fluentcopilot | none | none |
| architecture-intelligence-prototype | — | **null** |

Recommended `ignoreCommand` (skip deploy when 0):

```bash
git diff HEAD^ HEAD --quiet -- ':!docs' ':!reports' ':!.cursor' ':!**/*.md' ':!*.md' && exit 0 || exit 1
```

Vercel convention: **exit 1 = proceed with build**, exit 0 = skip. Confirm against current CLI docs before shipping (the sense of the exit code is easy to invert).

Also: **do not autodeploy content-only branches**; PR previews only.

---

## Duplicate / elastic build machines

Vercel flipped Kitletics to **turbo** after OOM and SoftwareGlimpse to **turbo** after long builds. Elastic turbo minutes cost more than standard.

**Fix the graph, don’t keep turbo as a lifestyle:**

- Kitletics: 75MB `src/content` + `generateStaticParams` on force-dynamic routes still loading the catalog at build.
- SoftwareGlimpse: ~13k prerendered pages (tabs × products, reverse compares, cartesian industry URLs).

---

## Observability / analytics in workflow

Web Analytics + Speed Insights are **on** for Kitletics, Glimpse, Hiking, Expat. Preview deployments inherit them unless dashboard-filtered.

Speed Insights Plus Events billed **$0.65 in August** on ExpatCopilot; Sep usage shows $0 — confirm the Plus SKU stays off.

---

## Recommended preview strategy

1. `main` → production only, after local `next build`.
2. Preview: **pull requests**, not every branch push.
3. Skip previews for Dependabot/docs if those appear later.
4. Kitletics 3 previews in Sep are fine; do not expand.
5. `ssoProtection: all_except_custom_domains` is already on — good (preview not indexed).

---

## AI-specific guardrail

If an agent needs a “does it compile?” signal, use **GitHub Actions `typecheck` / `next build`**, not Vercel production. Each Kitletics production deploy can be 4–12 minutes of **paid** Build CPU on a turbo machine.
