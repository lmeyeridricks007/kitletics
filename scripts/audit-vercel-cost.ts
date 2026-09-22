#!/usr/bin/env tsx
/**
 * Detect Vercel cost anti-patterns in a Next.js App Router repo.
 *
 *   npm run audit:vercel-cost
 *   npx tsx scripts/audit-vercel-cost.ts --root /path/to/other-project
 *
 * Exit 1 when any FAIL finding is present (CI-suitable).
 * Does not change application behaviour — detection only.
 */
import fs from "node:fs";
import path from "node:path";

type Severity = "FAIL" | "WARN" | "INFO";

type Finding = {
  severity: Severity;
  rule: string;
  file: string;
  detail: string;
};

const SKIP_DIR = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "coverage",
  ".vercel",
  "tmp",
  "public",
]);

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIR.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE_EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function read(file: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function rel(root: string, file: string): string {
  return path.relative(root, file).replaceAll("\\", "/");
}

/**
 * Intentionally request-time public surfaces.
 * These must stay dynamic: share-state results, affiliate hops (excluded via /go).
 */
function isIntentionalDynamicPublic(relPath: string): boolean {
  const p = relPath.replaceAll("\\", "/");
  return /\/app\/tools\/\[slug\]\/results\//.test(p);
}

function isPublicAppFile(relPath: string): boolean {
  const p = relPath.replaceAll("\\", "/");
  if (p.includes("/app/admin/") || p.includes("/app/(studio)/") || p.includes("/app/dev/")) {
    return false;
  }
  if (p.includes("/preview/")) return false;
  if (
    p.includes("/app/go/") ||
    p.includes("indexnow-key") ||
    p.includes("/app/api/") ||
    /(?:^|\/)api\//.test(p)
  ) {
    return false;
  }
  return /\/app\//.test(p);
}

function parseNextConfigImages(source: string): {
  deviceSizes: number[];
  imageSizes: number[];
  qualities: number[];
  formats: string[];
  minimumCacheTTL?: number;
  wildcardRemote: boolean;
} {
  const grabNums = (key: string): number[] => {
    const m = source.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`));
    if (!m) return [];
    return [...m[1].matchAll(/\d+/g)].map((x) => Number(x[0]));
  };
  const formats = [...source.matchAll(/["']image\/(avif|webp)["']/g)].map((m) => m[1]);
  const ttlExpr = source.match(/minimumCacheTTL\s*:\s*([0-9*\s]+)/);
  let minimumCacheTTL: number | undefined;
  if (ttlExpr && /^[0-9*\s]+$/.test(ttlExpr[1])) {
    minimumCacheTTL = ttlExpr[1]
      .split("*")
      .map((n) => Number(n.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .reduce((a, b) => a * b, 1);
  }
  return {
    deviceSizes: grabNums("deviceSizes"),
    imageSizes: grabNums("imageSizes"),
    qualities: grabNums("qualities"),
    formats: [...new Set(formats)],
    minimumCacheTTL,
    wildcardRemote: /hostname\s*:\s*["']\*\*["']/.test(source),
  };
}

function audit(root: string): Finding[] {
  const findings: Finding[] = [];
  const srcRoot = fs.existsSync(path.join(root, "src")) ? path.join(root, "src") : root;
  const files = walk(srcRoot);
  const extraConfigs = ["next.config.ts", "next.config.js", "next.config.mjs", "middleware.ts", "src/middleware.ts", "vercel.json"]
    .map((f) => path.join(root, f))
    .filter((f) => fs.existsSync(f));
  const all = [...new Set([...files, ...extraConfigs])];

  const vercelJsonPath = path.join(root, "vercel.json");
  if (!fs.existsSync(vercelJsonPath)) {
    findings.push({
      severity: "FAIL",
      rule: "missing-ignore-command",
      file: "vercel.json",
      detail: "No vercel.json. Every git push will rebuild production. Add ignoreCommand (Kitletics: node scripts/vercel-ignored-build.mjs).",
    });
  } else {
    const v = read(vercelJsonPath);
    if (!/ignoreCommand/.test(v)) {
      findings.push({
        severity: "FAIL",
        rule: "missing-ignore-command",
        file: "vercel.json",
        detail: "vercel.json has no ignoreCommand. Every git push will rebuild production/preview.",
      });
    } else if (!/vercel-ignored-build/.test(v)) {
      findings.push({
        severity: "WARN",
        rule: "missing-ignore-command",
        file: "vercel.json",
        detail: "ignoreCommand is set but does not call scripts/vercel-ignored-build.mjs. Confirm docs/data JSON-CSV is not skipped.",
      });
    }
  }

  for (const file of all) {
    const source = read(file);
    const r = rel(root, file);
    const publicApp = isPublicAppFile(r);
    const intentionalDynamic = isIntentionalDynamicPublic(r);

    if (
      publicApp &&
      !intentionalDynamic &&
      /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.test(source)
    ) {
      findings.push({
        severity: "FAIL",
        rule: "force-dynamic-public",
        file: r,
        detail: "Public route uses force-dynamic. Catalog/content pages should be static or ISR unless an ADR explains request-time freshness.",
      });
    }

    if (/cache:\s*['"]no-store['"]/.test(source) && publicApp) {
      findings.push({
        severity: "FAIL",
        rule: "no-store-public",
        file: r,
        detail: "Public catalog/content fetch uses cache: 'no-store'.",
      });
    }

    if (/unstable_noStore\s*\(/.test(source) && publicApp) {
      findings.push({
        severity: "FAIL",
        rule: "unstable-nostore-public",
        file: r,
        detail: "unstable_noStore() on a public App Router file.",
      });
    }

    const revalidateHits = [...source.matchAll(/export\s+const\s+revalidate\s*=\s*([0-9_]+)/g)];
    for (const hit of revalidateHits) {
      const seconds = Number(hit[1].replaceAll("_", ""));
      if (publicApp && seconds > 0 && seconds < 3600) {
        findings.push({
          severity: "WARN",
          rule: "short-revalidate",
          file: r,
          detail: `revalidate=${seconds}s (< 1 hour) on a public route. Prefer ≥ 86400 or on-demand revalidation.`,
        });
      }
      if (publicApp && seconds === 0) {
        findings.push({
          severity: "FAIL",
          rule: "revalidate-zero",
          file: r,
          detail: "revalidate=0 disables caching on a public route.",
        });
      }
    }

    if (publicApp && /draftMode\s*\(/.test(source)) {
      findings.push({
        severity: "FAIL",
        rule: "draft-mode-public",
        file: r,
        detail: "draftMode() dynamizes the route in Next 15+. Keep preview on a dedicated /preview route.",
      });
    }

    if (
      publicApp &&
      !intentionalDynamic &&
      (/from ["']next\/headers["']/.test(source) && /\bcookies\s*\(/.test(source) ||
        /getRequestRegion/.test(source))
    ) {
      findings.push({
        severity: "FAIL",
        rule: "cookies-public-rsc",
        file: r,
        detail: "cookies() / getRequestRegion() in a public server file opts the tree dynamic. Resolve region/consent on the client, not in RSC.",
      });
    }

    if (publicApp && /from ["']next\/headers["']/.test(source) && /\bheaders\s*\(/.test(source)) {
      findings.push({
        severity: "WARN",
        rule: "headers-public-rsc",
        file: r,
        detail: "headers() in a public server file can dynamize rendering.",
      });
    }
  }

  const middlewareFile = extraConfigs.find((f) => f.endsWith("middleware.ts"));
  if (middlewareFile) {
    const source = read(middlewareFile);
    const r = rel(root, middlewareFile);
    if (/\/images\/:path\*/.test(source) || /matcher:[\s\S]*\/images\//.test(source)) {
      findings.push({
        severity: "FAIL",
        rule: "middleware-images",
        file: r,
        detail: "Middleware matcher includes /images. Image requests should skip Edge middleware; use next.config rewrites or a Blob public URL.",
      });
    }
    if (!/matcher:/.test(source)) {
      findings.push({
        severity: "FAIL",
        rule: "middleware-unscoped",
        file: r,
        detail: "Middleware has no matcher — it runs on every request including static assets.",
      });
    } else if (!/_next\/static/.test(source) || !/_next\/image/.test(source)) {
      findings.push({
        severity: "WARN",
        rule: "middleware-matcher-broad",
        file: r,
        detail: "Middleware matcher does not clearly exclude _next/static and _next/image.",
      });
    }
    const matcherBlock = source.match(/matcher:\s*\[[\s\S]*?\]/);
    if (matcherBlock && !/js\|css|css\|js|woff/.test(matcherBlock[0])) {
      findings.push({
        severity: "WARN",
        rule: "middleware-fonts-js",
        file: r,
        detail: "Matcher may still run on JS/CSS/font requests. Exclude common static extensions.",
      });
    }
  }

  const nextConfig = extraConfigs.find((f) => path.basename(f).startsWith("next.config"));
  if (nextConfig) {
    const source = read(nextConfig);
    const r = rel(root, nextConfig);
    const img = parseNextConfigImages(source);
    const widths = (img.deviceSizes.length || 8) + (img.imageSizes.length || 16);
    const qualities = img.qualities.length || 1;
    const formats = Math.max(img.formats.length, 1);
    const variants = widths * qualities * formats;
    if (variants > 40) {
      findings.push({
        severity: "WARN",
        rule: "image-variant-explosion",
        file: r,
        detail: `Up to ${variants} optimizer variants per source (${widths} widths × ${qualities} qualities × ${formats} formats). Target ≤ 24 practical variants.`,
      });
    }
    if (img.wildcardRemote) {
      findings.push({
        severity: "FAIL",
        rule: "image-remote-wildcard",
        file: r,
        detail: "images.remotePatterns hostname '**' lets any HTTPS URL be transformed. Restrict to Blob + known CDNs.",
      });
    }
    if (img.minimumCacheTTL !== undefined && img.minimumCacheTTL < 60 * 60 * 24 * 7) {
      findings.push({
        severity: "WARN",
        rule: "image-short-cache-ttl",
        file: r,
        detail: `minimumCacheTTL=${img.minimumCacheTTL}s. Use ≥ 7 days (prefer 30 days) for catalog media.`,
      });
    }
  }

  const layoutCandidates = all.filter((f) => /layout\.(tsx|jsx|js)$/.test(f) && /app\/layout\./.test(rel(root, f)));
  for (const file of layoutCandidates) {
    const source = read(file);
    const r = rel(root, file);
    if (/SpeedInsights/.test(source) && !/sampleRate/.test(source)) {
      findings.push({
        severity: "WARN",
        rule: "speed-insights-unsampled",
        file: r,
        detail: "Speed Insights is mounted without sampleRate. Sample on high-crawl catalog sites.",
      });
    }
    if (/<Analytics\s*\/>/.test(source) || /from ["']@vercel\/analytics/.test(source)) {
      findings.push({
        severity: "INFO",
        rule: "web-analytics-enabled",
        file: r,
        detail: "Vercel Web Analytics is mounted. Keep on production; disable on preview if dashboard-configurable.",
      });
    }
  }

  return findings;
}

function printHelp(): void {
  console.log(`Vercel cost anti-pattern audit

Usage:
  npm run audit:vercel-cost
  npx tsx scripts/audit-vercel-cost.ts [--root <dir>] [--json]

Exit codes:
  0  no FAIL findings
  1  one or more FAIL findings
`);
}

function main(): void {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }
  const root = path.resolve(arg("root") ?? process.cwd());
  const findings = audit(root);
  const counts = {
    FAIL: findings.filter((f) => f.severity === "FAIL").length,
    WARN: findings.filter((f) => f.severity === "WARN").length,
    INFO: findings.filter((f) => f.severity === "INFO").length,
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ root, counts, findings }, null, 2));
  } else {
    console.log(`Vercel cost audit · ${root}`);
    console.log(`FAIL ${counts.FAIL} · WARN ${counts.WARN} · INFO ${counts.INFO}\n`);
    const order: Severity[] = ["FAIL", "WARN", "INFO"];
    for (const sev of order) {
      const group = findings.filter((f) => f.severity === sev);
      if (!group.length) continue;
      console.log(`## ${sev}`);
      for (const f of group) {
        console.log(`- [${f.rule}] ${f.file}`);
        console.log(`  ${f.detail}`);
      }
      console.log("");
    }
    if (!findings.length) console.log("No cost anti-patterns detected.");
  }

  if (counts.FAIL > 0) process.exitCode = 1;
}

main();
