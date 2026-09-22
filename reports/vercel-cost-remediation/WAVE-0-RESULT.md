# Wave 0 result — prevent unnecessary Vercel builds

**Date:** 2026-09-17  
**Repo:** Kitletics  
**Scope:** Wave 0 only. No rendering, ISR, middleware, or image-optimizer changes.

Official ignoreCommand semantics (Vercel `vercel.json` docs): **exit 0 = skip deployment**, **exit 1 = proceed with build**.

---

## Files changed (Wave 0)

| File | Change |
|---|---|
| `vercel.json` | **New.** `ignoreCommand`: `node scripts/vercel-ignored-build.mjs` |
| `scripts/vercel-ignored-build.mjs` | **New.** CLI for Vercel ignored-build (Node built-ins only; runs before `npm install`) |
| `scripts/lib/vercel-ignored-build.mjs` | **New.** Path classifier (fail-open) |
| `tests/vercel-ignored-build.test.ts` | **New.** Exit-code + skip/build classification tests |
| `package.json` | Added `validate:local`, `vercel:ignore-build`; kept `audit:vercel-cost` |
| `scripts/audit-vercel-cost.ts` | `missing-ignore-command` is now **FAIL** unless `ignoreCommand` calls the Kitletics script |
| `docs/VERCEL-COST-GUARDRAILS.md` | Permanent standard updated for the script, exit codes, and `validate:local` |
| `.cursor/rules/vercel-cost-guardrails.mdc` | **New.** Always-on Cursor rule |
| `.cursor/rules/vercel-deploy-discipline.mdc` | **New.** Always-on: no speculative Vercel pushes; batch; no auto-push |

This report: `reports/vercel-cost-remediation/WAVE-0-RESULT.md`.

**Not changed (intentionally):** `src/app/**`, `src/middleware.ts`, `next.config.ts` image/cache settings, ISR/`force-dynamic`. Those are Wave 1.

---

## Previous deployment behavior

- No `vercel.json`. Project API `commandForIgnoringBuildStep` was **null**.
- Every git push to `main` (and preview branches) ran a full Next.js production build on a **turbo** machine.
- Sep evidence: **16 production deploys in ~6 days**, avg **266s**, max **740s**. Failed builds still billed Build CPU.
- Docs, reports, `.cursor/`, and agent-only markdown still rebuilt production.
- Agents used Vercel as the compiler (`vercel fix` pattern on sibling projects; Kitletics “fix the Vercel build by including…”).

---

## New deployment behavior

After this Wave 0 commit is **pushed** (not done in this session):

1. Vercel clones the commit and runs `node scripts/vercel-ignored-build.mjs` **before** install/build.
2. The script diffs `VERCEL_GIT_PREVIOUS_SHA` when present (previous successful deployment on the branch), else `HEAD~1`.
3. If **every** changed file is documentation/audit-only → **exit 0** → deployment **Canceled** (no Build CPU).
4. If **any** production-affecting file changed, or the git range cannot be resolved → **exit 1** → full build (fail-open).
5. The **first** push that lands `vercel.json` + the script **will build** (those files affect deployment). After that, docs-only commits skip.

Local workflow (required before push):

```text
PLAN → IMPLEMENT LOCALLY → LINT → TYPECHECK → TEST → PRODUCTION BUILD LOCALLY
→ COST GUARDRAIL CHECK → REVIEW DIFF → COMMIT → PUSH → VERCEL
```

```bash
npm run validate:local      # lint && typecheck && test && next build
npm run audit:vercel-cost   # detector; Wave 1 FAILs remain until Wave 1
npm run vercel:ignore-build # optional: classify HEAD~1..HEAD
```

Nothing was pushed or deployed by the agent.

---

## Ignored-build behavior

**Why not the audit’s one-liner**  
`git diff HEAD^ HEAD --quiet -- ':!docs' ':!**/*.md' && exit 0 || exit 1`

1. `HEAD^` is the previous **commit**, not the previous **deployment**. A docs-only tip on top of unbuilt app commits would skip incorrectly.
2. This repo **reads JSON/CSV at runtime** from `docs/padel/data/` (admin catalog coverage) and `docs/quality/data/` (rendered-quality dashboard). Blanket `:!docs` would skip real app data.
3. ignoreCommand runs **before npm install**, so the script is plain Node (no `tsx` / `node_modules`).
4. Unknown paths **build** (fail-open). Missing parent SHA **builds**.

**Skip (only if the entire diff is in these buckets)**

- `docs/**` markdown / `.mdc` / `.txt` (documentation)
- `docs/prelaunch/**` (audit outputs, including JSON)
- `reports/**`
- `.cursor/**`
- `agents/**`
- `tests/**` (does not ship in the Next bundle)
- `data/staging/**`, `data/qa/**`
- root README / launch-readiness markdown / `.gitignore`
- `public/images/README.md`

**Never skip**

- `src/**`, `public/**` (except the README above)
- `scripts/**` (including this ignore script)
- `package.json` / lockfiles / `next.config.*` / `vercel.json` / `.vercelignore` / `tsconfig.json` / ESLint / PostCSS
- `docs/padel/data/**`, `docs/quality/data/**`, `docs/growth/data/**`, `docs/data-products/data/**`

**Verified locally**

| Diff | Exit | Meaning |
|---|---|---|
| `docs/*.md` + `reports/*` + `.cursor/*` | **0** | Skip |
| `src/app/page.tsx` (even with docs) | **1** | Build |
| `docs/padel/data/PADEL-SPEC-COVERAGE.csv` | **1** | Build (admin reads it) |
| Wave 0 file set (includes `vercel.json` + scripts) | **1** | Build (expected first deploy) |

---

## Local validation commands

| Command | Role |
|---|---|
| `npm run validate:local` | Lint + typecheck + test + production `next build` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run build` | `next build` |
| `npm run audit:vercel-cost` | Cost anti-pattern detector |
| `npm run vercel:ignore-build` | Ignored-build check (`--files`, `--from`, `--to`) |

---

## Cursor rules added

1. **`.cursor/rules/vercel-cost-guardrails.mdc`** (`alwaysApply: true`)  
   Distills `docs/VERCEL-COST-GUARDRAILS.md`: static/ISR for public catalog HTML, no RSC cookies/`draftMode` on sitemap pages, no `/images` middleware, no `hostname: "**"`, ignored-build must stay wired, never use Vercel as `tsc`.

2. **`.cursor/rules/vercel-deploy-discipline.mdc`** (`alwaysApply: true`)  
   Prohibits pushing speculative “does Vercel build?” fixes. Requires `validate:local` before push. Requires batching related changes. Forbids auto-push / auto-deploy.

---

## Tests performed

| Check | Result |
|---|---|
| `tests/vercel-ignored-build.test.ts` | **8/8 passed** (exit 0 skip / 1 build; docs skip; padel data builds; unknown path fail-open) |
| CLI `--files` smoke | Skip vs build exits match the table above |
| `npm run lint` | **Exit 0** (~14.5 min). 0 errors, 42 pre-existing warnings in `scripts/tmp/**` (not Wave 0) |
| `npm run typecheck` | **Exit 0** (~5.6 min) |
| `npm test` (full suite) | **Did not finish green.** First run SIGTERM (exit 143) after ~19 min; four catalog/content tests had already failed (padel accessories sitemap, padel setup URLs, padel brand-hub fallback, growth outreach copy). Those suites are **not** Wave 0 files. The working tree also contains a large **unrelated padel catalog WIP** that was already dirty. |
| `npm run audit:vercel-cost` | **Exit 1** — **FAIL 25 · WARN 1 · INFO 1**. `missing-ignore-command` is **gone**. Remaining FAILs are Wave 1 (`force-dynamic`, `cookies`/`getRequestRegion`, `/images` middleware, `hostname: "**"`). |

---

## Build result

| Attempt | Command | Result |
|---|---|---|
| 1 | `npm run build` | **Failed.** Compiled OK (110s). Static generation died on `/[sport]/page` → `/calisthenics` after 3× 60s timeouts under default workers. |
| 2 | `NODE_OPTIONS='--max-old-space-size=12288' npx next build --no-lint` | **Succeeded** (~14.3 min). Compiled 119s. **2972/2972** static pages generated (some routes retried after 60s, then recovered). Typecheck ran inside Next. Lint was skipped here because `npm run lint` had already passed. |

Local compile + typecheck are green. The first-attempt SSG timeout is the same class of pressure that put Kitletics on a **turbo** build machine (OOM / long builds). Wave 0 does not change that graph.

---

## Risks

1. **ignoreCommand is not live until pushed.** Until then, docs-only commits still rebuild production.
2. **Fail-open** means a shallow clone without `VERCEL_GIT_PREVIOUS_SHA` / `HEAD~1` will **build**. Safer than a false skip; still costs Build CPU on first-of-branch previews.
3. **Dashboard ignore field** must stay empty or match the repo script. A conflicting dashboard command is overridden by `vercel.json`, but leaving a wrong command in the UI is confusing.
4. **System env vars** must be exposed or `VERCEL_GIT_PREVIOUS_SHA` is empty and the script falls back to `HEAD~1` (weaker than previous-deployment diff).
5. **Working tree is mixed.** This session’s git status includes a large padel catalog/media/editorial WIP plus staging JSON. Do **not** push that blob as “Wave 0”.
6. Full `npm test` was not green in this environment (SIGTERM + unrelated catalog failures). Do not treat Vercel as the test runner to “see if those pass.”
7. Inverting the exit codes would **skip every real deploy** or **never skip**. Tests lock 0 = skip, 1 = build.

---

## Manual Vercel dashboard actions you still need to perform

Wave 0 cannot flip team-level analytics add-ons from git. Do these in the Vercel UI for project **kitletics** (and the other live sites when you copy this pattern).

### 1. Confirm ignored-build uses the repo script (Kitletics)

1. Open [Vercel Dashboard](https://vercel.com/) → team `leemeyeridricks-3740s-projects` → project **kitletics**.
2. **Settings → Git**.
3. **Ignored Build Step** / “Command for Ignoring Build Step”: leave **blank**.  
   `vercel.json` `ignoreCommand` overrides this field. Do **not** paste the audit one-liner (`git diff HEAD^ HEAD --quiet -- ':!docs' …`) — it is wrong for this repo.
4. After you push Wave 0, open the next deployment → Build logs. You should see `Ignored build check` from the Node script. Docs-only commits should end **Canceled**.

### 2. Expose system environment variables

1. Same project → **Settings → Environment Variables**.
2. Enable **Automatically Expose System Environment Variables** (if it is not already on).  
   Required so `VERCEL_GIT_PREVIOUS_SHA`, `VERCEL_GIT_COMMIT_SHA`, and `VERCEL_ENV` exist during ignoreCommand.

### 3. Observability / analytics (cost, not skip logic)

1. **Settings → Observability**: do **not** raise log retention. Turn **preview** tracing/logs **off** if they are on (production may stay at Pro default).
2. **Speed Insights**: confirm the paid **Speed Insights Plus** add-on is **off** (ExpatCopilot billed $0.65 in August; Kitletics should not enable it).
3. **Web Analytics**: keep on **production** if you have no other first-party analytics; disable on **preview** if the UI allows a per-environment filter.
4. Idle project **architecture-intelligence-prototype**: disable Speed Insights and Web Analytics entirely.

### 4. Do not pause `main` autodeploy once Wave 0 is on `main`

The remediation plan said to pause autodeploy *until* ignoreCommand exists. After this commit is on `main`, leave Git autodeploy **on**. Docs-only pushes will cancel; app pushes will still deploy. Pausing would force manual deploys for every content change in `src/`.

### 5. Preview policy

1. **Settings → Git**: production branch remains `main`.
2. Keep **SSO protection** on previews (`all_except_custom_domains`) — already good.
3. Do not enable “deploy every branch” beyond GitHub pull requests.

### 6. Build machine (do not “fix” turbo in Wave 0)

Leave the **turbo** machine. It was selected after OOM. Shrinking the static graph is Wave 1/3, not a dashboard downgrade today.

---

## Exact first-push checklist (when you choose to deploy Wave 0)

1. Isolate Wave 0 files from padel WIP (`git add` only the Wave 0 table above + this report).
2. `npm run validate:local`
3. `npm run audit:vercel-cost` (expect Wave 1 FAILs; `missing-ignore-command` must stay absent)
4. Review diff → commit → **explicit** push (agent will not push).
5. Watch the Vercel deployment: this first one **must build**.
6. Optionally push a docs-only commit afterward and confirm it is **Canceled**.

---

WAVE 0 STATUS: PASS  
SAFE TO DEPLOY: NO
