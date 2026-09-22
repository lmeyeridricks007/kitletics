/**
 * Kitletics ignored-build classifier.
 *
 * Vercel ignoreCommand exit codes (official vercel.json docs):
 *   0 = skip / cancel the deployment
 *   1 = proceed with the build
 *
 * Fail-open: if the git range cannot be resolved, or any changed file is not
 * provably documentation/audit-only, proceed with the build.
 *
 * Do not blanket-exclude every markdown file or the whole docs tree. This repo
 * reads JSON/CSV under docs/padel/data, docs/quality/data, and similar paths at
 * runtime (admin + quality dashboards). Those must still trigger a production build.
 */

export const EXIT_SKIP = 0;
export const EXIT_BUILD = 1;

const ALWAYS_BUILD_FILES = new Set([
  ".npmrc",
  ".nvmrc",
  ".vercelignore",
  "components.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "instrumentation.ts",
  "jsconfig.json",
  "middleware.ts",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tsconfig.build.json",
  "tsconfig.json",
  "vercel.json",
  "vercel.ts",
  "vitest.config.ts",
  "yarn.lock",
]);

const ALWAYS_BUILD_PREFIXES = [
  "src/",
  "public/",
  "scripts/",
  "docs/padel/data/",
  "docs/quality/data/",
  "docs/growth/data/",
  "docs/data-products/data/",
];

const SKIP_PREFIXES = [
  ".cursor/",
  "agents/",
  "data/qa/",
  "data/staging/",
  "docs/prelaunch/",
  "reports/",
  "tests/",
];

const SKIP_FILES = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  "CHANGELOG.md",
  "LICENSE",
  "PADEL_LAUNCH_READINESS.md",
  "README.md",
  "SITE_CRITICAL_REVIEW.md",
  "TENNIS_LAUNCH_READINESS.md",
]);

const SKIP_EXTENSIONS = new Set([
  ".md",
  ".mdc",
  ".markdown",
  ".txt",
]);

const SKIP_PUBLIC_MARKDOWN = new Set([
  "public/images/README.md",
]);

/**
 * @param {string} raw
 * @returns {string}
 */
export function normalizeRepoPath(raw) {
  return String(raw || "")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/^"/, "")
    .replace(/"$/, "");
}

/**
 * @param {string} file
 * @returns {boolean}
 */
export function isAlwaysBuildPath(file) {
  const p = normalizeRepoPath(file);
  if (!p) return false;
  if (ALWAYS_BUILD_FILES.has(p)) return true;
  if (p === "middleware.ts" || p === "src/middleware.ts") return true;
  if (SKIP_PUBLIC_MARKDOWN.has(p)) return false;
  return ALWAYS_BUILD_PREFIXES.some((prefix) => p === prefix.slice(0, -1) || p.startsWith(prefix));
}

/**
 * True when this path cannot affect the production Next.js application.
 * @param {string} file
 * @returns {boolean}
 */
export function isIgnorablePath(file) {
  const p = normalizeRepoPath(file);
  if (!p) return true;
  if (isAlwaysBuildPath(p)) return false;

  if (SKIP_FILES.has(p)) return true;
  if (SKIP_PUBLIC_MARKDOWN.has(p)) return true;
  if (SKIP_PREFIXES.some((prefix) => p === prefix.slice(0, -1) || p.startsWith(prefix))) {
    return true;
  }

  const base = p.split("/").pop() || p;
  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot).toLowerCase() : "";
  if (SKIP_EXTENSIONS.has(ext) && !p.startsWith("src/") && !p.startsWith("public/")) {
    return true;
  }

  // Spreadsheets at repo root are source material for import scripts, not the
  // Next compile graph. A content change still has to land in src/ to ship.
  if (!p.includes("/") && /\.(xlsx?|xlsm)$/i.test(base)) return true;

  return false;
}

/**
 * @param {string[]} files
 * @returns {{ skip: boolean, ignorable: string[], affecting: string[] }}
 */
export function classifyChangedFiles(files) {
  const ignorable = [];
  const affecting = [];
  for (const file of files) {
    const p = normalizeRepoPath(file);
    if (!p) continue;
    if (isIgnorablePath(p)) ignorable.push(p);
    else affecting.push(p);
  }
  return {
    skip: affecting.length === 0 && (ignorable.length > 0 || files.length === 0),
    ignorable,
    affecting,
  };
}

/**
 * @param {{ skip: boolean, ignorable?: string[], affecting?: string[] }} decision
 * @returns {number}
 */
export function exitCodeForDecision(decision) {
  return decision.skip ? EXIT_SKIP : EXIT_BUILD;
}
