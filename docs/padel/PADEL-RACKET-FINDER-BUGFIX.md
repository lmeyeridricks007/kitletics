# Padel Racket Finder bugfix

WRONG_PROFILE_LABEL:
root cause: `FinderAnswerSummary` hard-coded `Your running profile` for every Finder.
fix: Added `FinderUiConfig.summaryHeading`; Padel uses `Your racket profile`. Component defaults to `Your profile`.

DEAD_MATCHES_CTA:
root cause: Summary CTA used App Router `router.push` from a middleware-rewritten landing (`/tools/<slug>` → `/tools/finder/<slug>`). Soft navigation to `/tools/<slug>/results` could no-op with no error UI.
fix: `buildFinderResultsHref` + `window.location.assign` hard navigation; loading/disabled state; error alert if encode fails.

MATCHER_INPUT: confirmed — `primaryUse` / `primaryPriority` / `feelPreference` / `weightPreference` / `armComfortPriority` / `budget` normalize and score; sample beginner/control/light/under-€100 returns published `cat-padel-rackets` only.

RESULT_NAVIGATION: fixed — results href `/tools/padel-racket-finder/results?s=…`

RUNNING_COPY_LEAKAGE: 1 fixed (hard-coded summary heading). Padel definition + UI copy: 0 remaining user-facing leaks. (Code comment “Same Finder engine as Running/Fitness” left alone.)

TARGETED_TESTS: PASS — 3 files / 33 tests (`finder-padel-bugfix`, `finder-shell`, `finder`)

FULL_CI: DEFERRED_TO_GITHUB_ACTIONS

STOP.
