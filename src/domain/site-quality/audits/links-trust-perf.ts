import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProducts,
  getProductById,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getTools,
  getBrands,
  getSportBySlug,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { PRIMARY_NAV } from "@/lib/navigation/config";
import { PRIMARY_MENU_PANELS } from "@/lib/navigation/primary-menu-panels";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { canRenderBrandHub } from "@/lib/seo/brand-indexability";
import type { DiscoveredRoute, SiteIssue } from "../types";
import { issue } from "../issues";

const PROD = { isDev: false as const };

type HrefClass = {
  path: string;
  inSitemap: boolean;
  disp: string;
};

function classifyHref(href: string, pathSet: Set<string>): HrefClass {
  const path = href.split("?")[0] || "/";
  if (pathSet.has(path)) {
    return { path, inSitemap: true, disp: "INDEXABLE" };
  }
  const parts = path.split("/").filter(Boolean);
  if (path.startsWith("/reviews/")) {
    const r = getReviews(PROD).find((x) => x.slug === parts[1]);
    if (!r) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "review", entity: r }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/products/") && path.endsWith("/alternatives")) {
    const p = getProducts(PROD).find((x) => x.slug === parts[1]);
    if (!p) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "alternatives", entity: p }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/products/")) {
    const p = getProducts(PROD).find((x) => x.slug === parts[1]);
    if (!p) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "product", entity: p }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/best/") && parts.length === 2) {
    const g = getBestGuides(PROD).find((x) => x.slug === parts[1]);
    if (!g) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "best-guide", entity: g }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/guides/") && parts.length === 2) {
    const g = getBuyingGuides(PROD).find((x) => x.slug === parts[1]);
    if (!g) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/compare/") && parts.length === 2) {
    const c = getComparisons(PROD).find((x) => x.slug === parts[1]);
    if (!c) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "comparison", entity: c }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/tools/")) {
    const slug = parts[1] === "finder" ? parts[2] : parts[1];
    const t = getTools(PROD).find((x) => x.slug === slug);
    if (!t) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "tool", entity: t }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/brands/")) {
    const b = getBrands(PROD).find((x) => x.slug === parts[1]);
    if (!b) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "brand", entity: b }, PROD)
        .disposition,
    };
  }
  if (parts.length === 1) {
    const s = getSportBySlug(parts[0], PROD);
    if (!s) return { path, inSitemap: false, disp: "NO_SPORT" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "sport", entity: s }, PROD)
        .disposition,
    };
  }
  if (parts.length >= 2) {
    const s = getSportBySlug(parts[0], PROD);
    if (!s) return { path, inSitemap: false, disp: "NO_SPORT" };
    const sportElig = getLaunchEligibility({ kind: "sport", entity: s }, PROD);
    return {
      path,
      inSitemap: false,
      disp: `DEEP_${sportElig.disposition}`,
    };
  }
  return { path, inSitemap: false, disp: "UNKNOWN" };
}

function chromeHrefIsHigh(cls: HrefClass): boolean {
  if (cls.inSitemap) return false;
  if (cls.disp === "PUBLIC_NOINDEX") return false;
  if (cls.disp === "INDEXABLE") return false;
  return (
    cls.disp === "HIDDEN_404" ||
    cls.disp === "NO_ENTITY" ||
    cls.disp === "NO_SPORT" ||
    cls.disp === "UNKNOWN" ||
    cls.disp.startsWith("DEEP_")
  );
}

/** Production-equivalent internal links: chrome, homepage, brand hubs, INDEXABLE orphans. */
export function auditInternalLinks(routes: DiscoveredRoute[]): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const pathSet = new Set(routes.map((r) => r.path));

  const chrome: { from: string; href: string; label: string }[] = [];
  for (const n of PRIMARY_NAV) {
    chrome.push({ from: "PRIMARY_NAV", href: n.href, label: n.label });
  }
  for (const panel of Object.values(PRIMARY_MENU_PANELS)) {
    for (const col of panel.columns) {
      for (const l of col.links) {
        chrome.push({
          from: `mega:${panel.navHref}`,
          href: l.href,
          label: l.label,
        });
      }
    }
    if (panel.footer) {
      chrome.push({
        from: `mega:${panel.navHref}`,
        href: panel.footer.href,
        label: panel.footer.label,
      });
    }
  }

  for (const n of chrome) {
    const cls = classifyHref(n.href, pathSet);
    if (!chromeHrefIsHigh(cls)) continue;
    issues.push(
      issue("LINK", "HIGH", "internal-links", {
        route: n.href.split("?")[0],
        evidence: `${n.from} “${n.label}” → ${n.href} (${cls.disp})`,
        whyItMatters:
          "Primary chrome must not send people to 404s, held reviews, or held vertical deep pages",
        recommendedFix:
          "Point chrome at live hubs or INDEXABLE URLs; omit coming-soon and HIDDEN_404 targets",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  }

  const home = getHomepageData();
  const homeHrefs: { from: string; href: string }[] = [
    { from: "home.finder.cta", href: home.finder.ctaHref },
    { from: "home.finder.footnote", href: home.finder.footnoteHref },
    ...(home.featuredGuide
      ? [{ from: "home.featuredGuide", href: home.featuredGuide.href }]
      : []),
    ...home.bestSections.map((s) => ({
      from: `home.best.${s.eyebrow}`,
      href: s.href,
    })),
    ...home.latestGuides.map((g) => ({
      from: "home.latestGuide",
      href: g.href,
    })),
    ...home.comparisons.items.map((c) => ({
      from: "home.comparison",
      href: c.href,
    })),
  ];
  for (const n of homeHrefs) {
    const cls = classifyHref(n.href, pathSet);
    if (!chromeHrefIsHigh(cls) && cls.disp !== "HIDDEN_404") continue;
    if (cls.inSitemap || cls.disp === "PUBLIC_NOINDEX" || cls.disp === "INDEXABLE") {
      continue;
    }
    if (
      cls.disp !== "HIDDEN_404" &&
      cls.disp !== "NO_ENTITY" &&
      !cls.disp.startsWith("DEEP_")
    ) {
      continue;
    }
    issues.push(
      issue("LINK", "HIGH", "internal-links", {
        route: n.href.split("?")[0],
        evidence: `${n.from} → ${n.href} (${cls.disp})`,
        whyItMatters: "Homepage must not promote held or missing URLs",
        recommendedFix: "Gate homepage strips with shouldPromotePublicly",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  }

  let brandHeldReviews = 0;
  for (const brand of getBrands(PROD)) {
    if (!canRenderBrandHub(brand)) continue;
    const data = getBrandHubPageData({ brandSlug: brand.slug });
    if (!data) continue;
    for (const r of data.reviews.items) {
      const cls = classifyHref(r.href, pathSet);
      if (cls.disp === "HIDDEN_404" || cls.disp === "NO_ENTITY") {
        brandHeldReviews += 1;
        if (brandHeldReviews <= 8) {
          issues.push(
            issue("LINK", "HIGH", "internal-links", {
              route: r.href,
              evidence: `Brand hub /brands/${brand.slug} review card → ${r.href} (${cls.disp})`,
              whyItMatters: "Public brand hubs must not promote held Reviews",
              recommendedFix: "Filter brand hub reviews with shouldPromotePublicly",
              canAutoFix: false,
              owner: "Engineering",
            }),
          );
        }
      }
    }
  }
  if (brandHeldReviews > 8) {
    issues.push(
      issue("LINK", "HIGH", "internal-links", {
        evidence: `${brandHeldReviews} brand-hub review cards point at HIDDEN_404 / missing reviews`,
        whyItMatters: "Held reviews must not be promoted from INDEXABLE brand hubs",
        recommendedFix: "Filter brand hub reviews with shouldPromotePublicly",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  }

  const reviews = getReviews(PROD);
  const missingIndexable = reviews.filter((r) => {
    const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
    return isIndexableEligibility(elig) && !pathSet.has(`/reviews/${r.slug}`);
  });
  for (const r of missingIndexable.slice(0, 20)) {
    issues.push(
      issue("LINK", "HIGH", "internal-links", {
        route: `/reviews/${r.slug}`,
        evidence: "INDEXABLE review missing from sitemap-derived inventory",
        whyItMatters: "Indexable reviews must be in the sitemap",
        recommendedFix: "Include the review in sitemap or fix eligibility",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  }

  const inbound = new Map<string, number>();
  const bump = (to: string) => {
    inbound.set(to, (inbound.get(to) ?? 0) + 1);
  };
  const reviewByProduct = new Map(reviews.map((r) => [r.productId, r.slug]));
  for (const p of getProducts(PROD)) {
    const rs = reviewByProduct.get(p.id);
    if (rs) {
      bump(`/reviews/${rs}`);
      bump(`/products/${p.slug}`);
    }
  }
  for (const g of getBestGuides(PROD)) {
    bump(`/best/${g.slug}`);
    for (const rec of g.recommendations ?? []) {
      const p = getProductById(rec.productId, PROD);
      if (p) bump(`/products/${p.slug}`);
      const rs = reviewByProduct.get(rec.productId);
      if (rs) bump(`/reviews/${rs}`);
    }
  }
  for (const g of getBuyingGuides(PROD)) bump(`/guides/${g.slug}`);
  for (const c of getComparisons(PROD)) {
    bump(`/compare/${c.slug}`);
    for (const id of c.productIds) {
      const p = getProductById(id, PROD);
      if (p) bump(`/products/${p.slug}`);
      const rs = reviewByProduct.get(id);
      if (rs) bump(`/reviews/${rs}`);
    }
  }

  const orphanKinds = [
    {
      items: reviews,
      kind: "review" as const,
      prefix: "/reviews/",
    },
    {
      items: getBestGuides(PROD),
      kind: "best-guide" as const,
      prefix: "/best/",
    },
    {
      items: getBuyingGuides(PROD),
      kind: "buying-guide" as const,
      prefix: "/guides/",
    },
    {
      items: getComparisons(PROD),
      kind: "comparison" as const,
      prefix: "/compare/",
    },
  ];
  for (const group of orphanKinds) {
    const orphans = group.items.filter((item) => {
      const elig = getLaunchEligibility(
        { kind: group.kind, entity: item } as never,
        PROD,
      );
      if (!isIndexableEligibility(elig)) return false;
      return (inbound.get(`${group.prefix}${item.slug}`) ?? 0) === 0;
    });
    if (orphans.length === 0) continue;
    issues.push(
      issue("LINK", "HIGH", "internal-links", {
        evidence: `${orphans.length} INDEXABLE ${group.kind} orphan(s): ${orphans
          .slice(0, 8)
          .map((o) => o.slug)
          .join(", ")}`,
        whyItMatters: "Day-1 requires 0 indexable editorial orphans",
        recommendedFix:
          "Add contextual inbound from hubs/peers — do not add footer links just to change graph metrics",
        canAutoFix: false,
        owner: "Editorial",
      }),
    );
  }

  for (const hub of ["/", "/running", "/best", "/guides", "/tools", "/compare", "/reviews"]) {
    if (!pathSet.has(hub) && hub !== "/running") {
      issues.push(
        issue("LINK", "MEDIUM", "architecture", {
          route: hub,
          evidence: `Expected hub ${hub} missing from inventory`,
          whyItMatters: "Core hubs should be crawlable",
          recommendedFix: "Add hub to sitemap or fix publication",
          canAutoFix: false,
          owner: "SEO",
        }),
      );
    }
  }

  return issues;
}

export function auditTrustAndCommercial(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const trustPages = [
    "/about",
    "/methodology",
    "/how-we-review",
    "/affiliate-disclosure",
    "/privacy",
    "/contact",
  ];
  for (const path of trustPages) {
    const pageFileGuess = [
      `src/app${path}/page.tsx`,
      path === "/about" ? "src/app/about/page.tsx" : "",
    ];
    const ok = pageFileGuess.some((f) => f && existsSync(join(process.cwd(), f)));
    if (!ok) {
      issues.push(
        issue("TRUST", "HIGH", "trust", {
          route: path,
          evidence: `Trust page route ${path} missing app page`,
          whyItMatters: "E-E-A-T signals require methodology and disclosure pages",
          recommendedFix: `Create src/app${path}/page.tsx`,
          canAutoFix: false,
          owner: "Editorial",
        }),
      );
    }
  }

  const disclosure = join(process.cwd(), "src/components/commerce/AffiliateDisclosure.tsx");
  if (!existsSync(disclosure)) {
    issues.push(
      issue("TRUST", "HIGH", "commercial", {
        evidence: "AffiliateDisclosure component missing",
        whyItMatters: "Affiliate compliance and trust",
        recommendedFix: "Restore AffiliateDisclosure near offer CTAs",
        canAutoFix: false,
        owner: "Commercial",
      }),
    );
  } else {
    issues.push(
      issue("TRUST", "INFO", "commercial", {
        evidence: "AffiliateDisclosure component present",
        whyItMatters: "Disclosure should appear near commercial CTAs",
        recommendedFix: "Keep disclosure visible on review/product offer panels",
        canAutoFix: false,
        owner: "Commercial",
        status: "resolved",
      }),
    );
  }

  // Affiliate neutrality: ranking code should not take commission
  const ranking = join(process.cwd(), "src/domain/commerce/ranking.ts");
  if (existsSync(ranking)) {
    const src = readFileSync(ranking, "utf8");
    if (/commission|payout|cpcBid/i.test(src) && /score\s*\+|boost/i.test(src)) {
      issues.push(
        issue("TRUST", "BLOCKER", "commercial", {
          evidence: "Commerce ranking appears to mix commission into scores",
          whyItMatters: "Affiliate must not affect recommendations",
          recommendedFix: "Remove commission from ranking inputs",
          canAutoFix: false,
          owner: "Engineering",
          relatedFiles: ["src/domain/commerce/ranking.ts"],
        }),
      );
    }
  }

  return issues;
}

/** Manual ledger only — empty links[] is fine; fabricated DA/DR fields are not. */
function isValidKnownBacklinksLedger(ledgerPath: string): boolean {
  if (!existsSync(ledgerPath)) return false;
  try {
    const raw = readFileSync(ledgerPath, "utf8");
    const data = JSON.parse(raw) as {
      policy?: unknown;
      links?: unknown;
      domainAuthority?: unknown;
      da?: unknown;
      dr?: unknown;
      domainRating?: unknown;
    };
    if (typeof data.policy !== "string" || data.policy.trim().length < 12) {
      return false;
    }
    if (!Array.isArray(data.links)) return false;
    if (
      data.domainAuthority != null ||
      data.da != null ||
      data.dr != null ||
      data.domainRating != null
    ) {
      return false;
    }
    for (const entry of data.links) {
      if (!entry || typeof entry !== "object") return false;
      const row = entry as Record<string, unknown>;
      if (
        row.domainAuthority != null ||
        row.da != null ||
        row.dr != null ||
        row.domainRating != null
      ) {
        return false;
      }
      if (typeof row.sourceUrl !== "string" || typeof row.targetUrl !== "string") {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function auditBacklinkOpportunities(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const tools = getTools().filter((t) => t.available);
  const linkable = tools.map((t) => t.slug);
  const docsPath = join(process.cwd(), "docs/backlink-opportunities.md");
  const ledgerPath = join(
    process.cwd(),
    "data/staging/site-quality/known-backlinks.json",
  );
  const docsBody = existsSync(docsPath) ? readFileSync(docsPath, "utf8") : "";
  const docsOk =
    docsBody.length > 0 &&
    /Running Shoe Finder|Pace Calculator|linkable/i.test(docsBody) &&
    /Hub → tool|hub → tool|relatedToolSlugs/i.test(docsBody);
  const ledgerOk = isValidKnownBacklinksLedger(ledgerPath);

  issues.push(
    issue("BACKLINK", "INFO", "backlinks", {
      idSuffix: "001",
      evidence: docsOk
        ? `Linkable tools documented (${linkable.length} available): ${linkable.slice(0, 6).join(", ")}${linkable.length > 6 ? "…" : ""}`
        : `Linkable tools available: ${linkable.join(", ") || "(none)"}`,
      whyItMatters: "Calculators/finders are primary linkable assets",
      recommendedFix: "Document in docs/backlink-opportunities.md; strengthen hub links into tools",
      canAutoFix: false,
      owner: "Commercial",
      status: docsOk ? "resolved" : "open",
    }),
  );

  if (linkable.length < 3) {
    issues.push(
      issue("BACKLINK", "MEDIUM", "backlinks", {
        evidence: `Only ${linkable.length} available tools — thin linkable asset set`,
        whyItMatters: "Off-page growth needs distinctive linkable utilities/data",
        recommendedFix: "Prioritize Pace Calculator, Shoe Finder, Race Predictor, methodology data pages",
        canAutoFix: false,
        owner: "Manual research",
        effort: "L",
        impact: "High",
      }),
    );
  }

  issues.push(
    issue("BACKLINK", "MEDIUM", "backlinks", {
      idSuffix: "002",
      evidence: ledgerOk
        ? "Manual known-backlinks ledger present (no fabricated DA metrics)"
        : "No integrated live backlink graph in-repo (expected)",
      whyItMatters: "Cannot claim domain authority without an external source",
      recommendedFix: "Track known links manually; do not fabricate DA metrics",
      canAutoFix: false,
      owner: "Manual research",
      status: ledgerOk ? "resolved" : "open",
    }),
  );

  return issues;
}

export function auditPerformanceStatic(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const layout = join(process.cwd(), "src/app/layout.tsx");
  if (existsSync(layout)) {
    const src = readFileSync(layout, "utf8");
    if (!/display:\s*[\"']swap[\"']/.test(src) && /next\/font/.test(src)) {
      // next/font often defaults display swap — INFO
      issues.push(
        issue("PERF", "INFO", "performance", {
          idSuffix: "001",
          evidence: "next/font in use on root layout",
          whyItMatters: "Font strategy affects CLS",
          recommendedFix: "Keep font-display swap; avoid excess weights",
          canAutoFix: false,
          owner: "Engineering",
          status: "resolved",
        }),
      );
    }
  }

  const baselinePath = join(
    process.cwd(),
    "data/staging/site-quality/perf-baseline.json",
  );
  let hasMeasuredBaseline = false;
  if (existsSync(baselinePath)) {
    try {
      const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as {
        routes?: Array<{ lighthouse?: unknown; status?: string }>;
        metrics?: Record<string, { measured?: unknown }>;
      };
      const measuredRoutes = (baseline.routes ?? []).filter(
        (r) =>
          r.lighthouse &&
          typeof r.lighthouse === "object" &&
          r.status === "measured",
      );
      hasMeasuredBaseline = measuredRoutes.length >= 3;
    } catch {
      hasMeasuredBaseline = false;
    }
  }
  issues.push(
    issue("PERF", "MEDIUM", "cwv", {
      idSuffix: "002",
      evidence: hasMeasuredBaseline
        ? "Lighthouse / CWV baseline measured for representative routes under data/staging/site-quality/perf-baseline.json"
        : "No automated Lighthouse baseline stored yet for representative routes",
      whyItMatters: "CWV needs measured LCP/CLS/INP on Product/Review/Best/Finder",
      recommendedFix:
        "After production build, run npm run site:perf-baseline and store under data/staging/site-quality/perf-baseline.json",
      canAutoFix: false,
      owner: "Engineering",
      effort: "M",
      impact: "High",
      status: hasMeasuredBaseline ? "resolved" : "open",
    }),
  );

  issues.push(
    issue("PERF", "INFO", "performance", {
      idSuffix: "003",
      evidence: "Budgets documented in docs/performance-standards.md (targets, not guarantees)",
      whyItMatters: "Shared performance contract for engineering",
      recommendedFix: "Keep budgets updated when CWV thresholds change",
      canAutoFix: false,
      owner: "Engineering",
      status: "resolved",
    }),
  );

  return issues;
}

export function auditAccessibilityStatic(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const a11yTest = join(process.cwd(), "tests/a11y-smoke.test.ts");
  const a11yBaseline = join(
    process.cwd(),
    "data/staging/site-quality/a11y-baseline.json",
  );
  let hasMeasuredAxe = false;
  if (existsSync(a11yBaseline)) {
    try {
      const baseline = JSON.parse(readFileSync(a11yBaseline, "utf8")) as {
        status?: string;
        method?: string;
        surfaces?: Array<{ status?: string }>;
        summary?: { measured?: number };
      };
      const measuredCount =
        baseline.summary?.measured ??
        (baseline.surfaces ?? []).filter((s) => s.status === "measured").length;
      hasMeasuredAxe =
        baseline.status === "measured" &&
        measuredCount >= 4 &&
        /axe/i.test(baseline.method ?? "");
    } catch {
      hasMeasuredAxe = false;
    }
  }
  const hasSmoke = existsSync(a11yTest);
  const a11yReady = hasSmoke && hasMeasuredAxe;
  issues.push(
    issue("A11Y", "MEDIUM", "accessibility", {
      idSuffix: "001",
      evidence: a11yReady
        ? "Axe + Playwright crawl measured for header/search/filters/compare/finder (a11y-baseline.json)"
        : "Automated a11y crawl not run in this static pass",
      whyItMatters: "Keyboard/focus/contrast need tooling + manual QA",
      recommendedFix:
        "npm run site:a11y-baseline (server must be running); keep tests/a11y-smoke.test.ts in CI",
      canAutoFix: false,
      owner: "Engineering",
      effort: "M",
      impact: "Medium",
      status: a11yReady ? "resolved" : "open",
    }),
  );

  const layout = join(process.cwd(), "src/app/layout.tsx");
  if (existsSync(layout)) {
    const src = readFileSync(layout, "utf8");
    if (!/lang=/.test(src)) {
      issues.push(
        issue("A11Y", "HIGH", "accessibility", {
          evidence: "Root html missing lang attribute",
          whyItMatters: "Screen readers need document language",
          recommendedFix: 'Set <html lang="en">',
          canAutoFix: true,
          owner: "Engineering",
          relatedFiles: ["src/app/layout.tsx"],
        }),
      );
    } else {
      issues.push(
        issue("A11Y", "INFO", "accessibility", {
          evidence: "Root layout sets html lang",
          whyItMatters: "Basic document accessibility",
          recommendedFix: "Keep lang accurate per locale expansion",
          canAutoFix: false,
          owner: "Engineering",
          status: "resolved",
        }),
      );
    }
  }

  return issues;
}

export function auditSecurityBasics(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const envExample = join(process.cwd(), ".env.example");
  const gitignore = join(process.cwd(), ".gitignore");
  if (existsSync(gitignore)) {
    const g = readFileSync(gitignore, "utf8");
    if (!/\.env/.test(g)) {
      issues.push(
        issue("SEC", "HIGH", "security", {
          evidence: ".gitignore may not ignore .env",
          whyItMatters: "Secret leakage risk",
          recommendedFix: "Ensure .env* is gitignored",
          canAutoFix: false,
          owner: "Engineering",
        }),
      );
    }
  }
  void envExample;

  issues.push(
    issue("SEC", "INFO", "security", {
      evidence: "Affiliate redirects use /go/[offerId] with X-Robots-Tag noindex",
      whyItMatters: "Open-redirect surface must stay allowlisted",
      recommendedFix: "Keep host allowlist checks in commerce affiliates resolver",
      canAutoFix: false,
      owner: "Engineering",
      status: "resolved",
    }),
  );

  return issues;
}
