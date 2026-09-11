import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { siteConfig, SEED_DATES } from "@/content/config";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getProducts, getReviews, getSports } from "@/repositories";
import type { DiscoveredRoute, SiteIssue } from "../types";
import { issue } from "../issues";

export function auditTechnicalSeo(routes: DiscoveredRoute[]): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const layoutPath = join(process.cwd(), "src/app/layout.tsx");
  const layout = existsSync(layoutPath) ? readFileSync(layoutPath, "utf8") : "";

  if (!/metadataBase/.test(layout)) {
    issues.push(
      issue("SEO", "HIGH", "technical-seo", {
        route: "/",
        evidence: "Root layout metadata lacks metadataBase",
        whyItMatters:
          "Relative OG/canonical URLs may resolve incorrectly for crawlers and social previews",
        recommendedFix: `Add metadataBase: new URL("${siteConfig.url}") to root layout metadata`,
        canAutoFix: true,
        owner: "Engineering",
        relatedFiles: ["src/app/layout.tsx"],
        effort: "XS",
        impact: "High",
      }),
    );
  }

  if (!siteConfig.url.startsWith("https://")) {
    issues.push(
      issue("SEO", "BLOCKER", "technical-seo", {
        evidence: `siteConfig.url is ${siteConfig.url}`,
        whyItMatters: "Production canonicals must be HTTPS",
        recommendedFix: "Set siteConfig.url to https://kitletics.com",
        canAutoFix: false,
        owner: "Engineering",
        relatedFiles: ["src/content/config.ts"],
      }),
    );
  }

  const robotsConfig = robots();
  const rule = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]
    : robotsConfig.rules;
  const disallowRaw = rule?.disallow;
  const disallow = (
    Array.isArray(disallowRaw) ? disallowRaw : disallowRaw ? [disallowRaw] : []
  ).map(String);

  if (disallow.some((d) => d === "/")) {
    issues.push(
      issue("SEO", "BLOCKER", "indexation", {
        evidence: "robots.txt disallows /",
        whyItMatters: "Sitewide disallow blocks crawl/indexation",
        recommendedFix: "Remove sitewide disallow; keep /go /api /admin /preview only",
        canAutoFix: false,
        owner: "SEO",
        relatedFiles: ["src/app/robots.ts"],
      }),
    );
  }

  const requiredDisallow = ["/go/", "/api/", "/preview/"];
  for (const d of requiredDisallow) {
    if (!disallow.includes(d)) {
      issues.push(
        issue("SEO", "HIGH", "indexation", {
          evidence: `robots.txt missing disallow ${d}`,
          whyItMatters: "Affiliate/API/preview surfaces should stay out of the index",
          recommendedFix: `Add ${d} to robots disallow list`,
          canAutoFix: true,
          owner: "SEO",
          relatedFiles: ["src/app/robots.ts"],
          effort: "XS",
          impact: "High",
        }),
      );
    }
  }

  // Sitemap lastmod integrity — build-time `now` on static hubs
  const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
  if (/lastModified:\s*now/.test(sitemapSrc)) {
    issues.push(
      issue("SEO", "MEDIUM", "technical-seo", {
        route: "/sitemap.xml",
        evidence: "sitemap.ts uses lastModified: now for some entries (rebuild churn)",
        whyItMatters:
          "Fake freshness signals confuse crawlers; lastmod should reflect material content updates",
        recommendedFix: `Use entity updatedAt or SEED_DATES.updated (${SEED_DATES.updated}) instead of Date.now()`,
        canAutoFix: true,
        owner: "SEO",
        relatedFiles: ["src/app/sitemap.ts"],
        effort: "S",
        impact: "Medium",
      }),
    );
  }

  const entries = sitemap();
  if (entries.length < 50) {
    issues.push(
      issue("SEO", "HIGH", "crawl", {
        evidence: `Sitemap only has ${entries.length} URLs`,
        whyItMatters: "Catalog sites need broad published coverage in the sitemap",
        recommendedFix: "Verify publication resolver and entity loops in sitemap.ts",
        canAutoFix: false,
        owner: "Engineering",
        relatedFiles: ["src/app/sitemap.ts"],
      }),
    );
  } else {
    issues.push(
      issue("SEO", "INFO", "crawl", {
        evidence: `Sitemap enumerates ${entries.length} URLs; route inventory ${routes.length}`,
        whyItMatters: "Healthy crawl corpus for discovery",
        recommendedFix: "Keep publication gates in sync with sitemap",
        canAutoFix: false,
        owner: "SEO",
        status: "resolved",
      }),
    );
  }

  // Coming-soon sports must not appear in sitemap
  const comingSoonSlugs = new Set(
    getSports()
      .filter((s) => s.contentStatus !== "live")
      .map((s) => s.slug),
  );
  const comingSoonInSitemap = entries.filter((e) => {
    try {
      const path = new URL(e.url).pathname.replace(/\/$/, "") || "/";
      const parts = path.split("/").filter(Boolean);
      return parts.length === 1 && comingSoonSlugs.has(parts[0]);
    } catch {
      return false;
    }
  });
  if (comingSoonInSitemap.length > 0) {
    issues.push(
      issue("SEO", "HIGH", "indexation", {
        evidence: `${comingSoonInSitemap.length} coming-soon sport URL(s) still in sitemap`,
        whyItMatters: "Thin coming-soon hubs create soft-404 / thin-index risk",
        recommendedFix: "Exclude contentStatus !== live sports from sitemap.ts; 404 non-live sport hubs",
        canAutoFix: false,
        owner: "SEO",
        relatedFiles: ["src/app/sitemap.ts", "src/lib/seo/metadata.ts"],
      }),
    );
  } else {
    issues.push(
      issue("SEO", "INFO", "indexation", {
        idSuffix: "010",
        evidence: "No coming-soon sport hubs in sitemap",
        whyItMatters: "Thin placeholders should stay out of the crawl corpus until live",
        recommendedFix: "Keep excluding non-live sports from sitemap",
        canAutoFix: false,
        owner: "SEO",
        status: "resolved",
      }),
    );
  }

  const goLiveDoc = join(process.cwd(), "docs/go-live-seo.md");
  const envExample = join(process.cwd(), ".env.example");
  const ogDefault = join(process.cwd(), "public/og/default.png");
  const nextConfigPath = join(process.cwd(), "next.config.ts");
  const nextConfig = existsSync(nextConfigPath)
    ? readFileSync(nextConfigPath, "utf8")
    : "";
  const goLiveOk =
    existsSync(goLiveDoc) &&
    /Search Console|sitemap\.xml/i.test(readFileSync(goLiveDoc, "utf8"));
  const envOk =
    existsSync(envExample) &&
    /GOOGLE_SITE_VERIFICATION/i.test(readFileSync(envExample, "utf8"));
  const ogOk = existsSync(ogDefault);
  const headersOk =
    /Strict-Transport-Security/.test(nextConfig) &&
    /X-Content-Type-Options/.test(nextConfig) &&
    /Referrer-Policy/.test(nextConfig);

  if (!goLiveOk || !envOk) {
    issues.push(
      issue("SEO", "MEDIUM", "technical-seo", {
        evidence: "Go-live SEO doc or .env.example verification hooks missing",
        whyItMatters: "GSC/Bing registration needs documented env tokens and ops steps",
        recommendedFix: "Add docs/go-live-seo.md and NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to .env.example",
        canAutoFix: false,
        owner: "SEO",
        relatedFiles: ["docs/go-live-seo.md", ".env.example"],
      }),
    );
  } else {
    issues.push(
      issue("SEO", "INFO", "technical-seo", {
        idSuffix: "011",
        evidence: "Go-live SEO checklist + env verification hooks documented",
        whyItMatters: "Ops can verify GSC/Bing without inventing tokens in code",
        recommendedFix: "Keep docs/go-live-seo.md in sync with deploy env",
        canAutoFix: false,
        owner: "SEO",
        status: "resolved",
      }),
    );
  }

  if (!ogOk || !/twitter|openGraph|og\/default/i.test(layout)) {
    issues.push(
      issue("SEO", "MEDIUM", "technical-seo", {
        evidence: "Default OG image or Twitter card metadata missing",
        whyItMatters: "Social/search previews need a reliable share image",
        recommendedFix: "Add public/og/default.png and Twitter summary_large_image in root metadata",
        canAutoFix: false,
        owner: "Engineering",
        relatedFiles: ["public/og/default.png", "src/app/layout.tsx"],
      }),
    );
  } else {
    issues.push(
      issue("SEO", "INFO", "technical-seo", {
        idSuffix: "012",
        evidence: "Default OG image + Twitter card metadata present",
        whyItMatters: "Consistent previews when page-level ogImage is absent",
        recommendedFix: "Keep /og/default.png current with brand",
        canAutoFix: false,
        owner: "Engineering",
        status: "resolved",
      }),
    );
  }

  if (!headersOk) {
    issues.push(
      issue("SEO", "MEDIUM", "technical-seo", {
        evidence: "Security headers missing or incomplete in next.config.ts",
        whyItMatters: "HSTS/nosniff/frame controls are baseline trust signals for go-live",
        recommendedFix: "Add HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options in headers()",
        canAutoFix: false,
        owner: "Engineering",
        relatedFiles: ["next.config.ts"],
      }),
    );
  } else {
    issues.push(
      issue("SEO", "INFO", "technical-seo", {
        idSuffix: "013",
        evidence: "Security headers configured in next.config.ts",
        whyItMatters: "Baseline transport and framing protections for production",
        recommendedFix: "Tighten CSP iteratively without breaking assets",
        canAutoFix: false,
        owner: "Engineering",
        status: "resolved",
      }),
    );
  }

  // Search should be noindex policy
  const searchRoute = routes.find((r) => r.path === "/search");
  if (searchRoute?.indexable) {
    issues.push(
      issue("SEO", "HIGH", "indexation", {
        route: "/search",
        evidence: "Search classified as indexable in inventory",
        whyItMatters: "Query/search UX pages create thin duplicate indexation risk",
        recommendedFix: "Ensure /search is noindex and excluded from sitemap",
        canAutoFix: false,
        owner: "SEO",
      }),
    );
  }

  // Future content: scheduled products must not appear in published getters
  const scheduledLeak = getProducts({ isDev: true }).filter(
    (p) => (p as { status?: string }).status === "scheduled",
  );
  // Production getters exclude scheduled — check published list doesn't include future seed date as live
  const published = getProducts();
  const futurePublished = published.filter(
    (p) => p.publishedAt && p.publishedAt > new Date().toISOString() && p.status === "published",
  );
  if (futurePublished.length) {
    issues.push(
      issue("SEO", "BLOCKER", "indexation", {
        evidence: `${futurePublished.length} published products with future publishedAt`,
        whyItMatters: "Future content must 404 / stay out of sitemap and nav",
        recommendedFix: "Fix publication status/dates; never ship scheduled as published",
        canAutoFix: false,
        owner: "Engineering",
        relatedFiles: ["src/lib/publishing/resolver.ts"],
      }),
    );
  }
  void scheduledLeak;
  void getReviews;

  return issues;
}
