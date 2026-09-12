/**
 * Fresh production-HTML rendered-quality crawl.
 * Fetches every indexable sitemap URL from a running Next production server.
 * Does not reuse previous CSV statuses.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { classifyDecisionLine } from "@/lib/decision-copy/classify";
import {
  classifySemanticPlacement,
  isIndexableSemanticFail,
} from "@/lib/media/semantic-image/classify";
import {
  inferEditorialTopic,
  normalizeSrc,
} from "@/lib/media/semantic-image/subjects";
import { inspectPublicContentCorruption } from "@/lib/review/public-content-corruption";

const BASE = (process.env.CRAWL_BASE ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const OUT = join(process.cwd(), "docs/prelaunch/data");
const CONCURRENCY = 2;
const TIMEOUT_MS = 30000;

const TOKEN_RES: Array<{ name: string; re: RegExp }> = [
  { name: "skuslug", re: /skuslug[a-z0-9]*/i },
  { name: "skuid", re: /skuid[a-z0-9]*/i },
  { name: "gen_concat", re: /\bgen\d+[a-z][a-z0-9]{4,}/i },
  {
    name: "value_field_slug",
    re: /\b\d{1,4}(weight|heelstack|forefootstack|drop|capacity|batterygps|batterysmartwatch)[a-z0-9]{4,}/i,
  },
  {
    name: "slug_field_value",
    re: /\b[a-z]{6,}(weight|heelstack|forefootstack|drop|cushionlevel|cushionfeel|ridecharacter|stability|capacity|displaytype|touchscreen|multibandgps)[a-z0-9]+/i,
  },
  { name: "concatenated_token_phrase", re: /concatenated\s+\w+\s+token/i },
  { name: "object_object", re: /\[object Object\]/ },
  { name: "undefined_token", re: /(?:^|[^\w.])undefined(?:[^\w.]|$)/ },
  { name: "nan_token", re: /(?:^|[^\w.])NaN(?:[^\w.]|$)/ },
];

const MACHINE_RES: Array<{ name: string; re: RegExp }> = [
  { name: "already_decided_lane", re: /already decided the lane/i },
  { name: "headline_trait", re: /as the headline trait/i },
  { name: "whatever_optimizes", re: /whatever .+ optimizes for/i },
  { name: "catalogued_to_deliver", re: /catalogued to deliver/i },
  { name: "pause_if_not_a", re: /i'd pause if not a /i },
  { name: "look_elsewhere_if_not_a", re: /look elsewhere if not a /i },
  { name: "main_job_matches_week", re: /when its main job matches most of your week/i },
  { name: "rotate_or_compare_against", re: /will rotate or compare against/i },
  { name: "do_everything_compromise", re: /more than a do-everything compromise/i },
  { name: "you_need_not_a", re: /you need not a /i },
  { name: "expert_research_dump", re: /kitletics expert research review\. how we assessed it:/i },
  { name: "intended_job_framing", re: /this exact .+ brief on /i },
  { name: "walk_away_from", re: /walk away from .+ when /i },
  { name: "best_audience_for", re: /best audience for .+:/i },
  { name: "shows_up_more_often_plan", re: /shows up more often in your (plan|week)/i },
];

type Issue = {
  issue_id: string;
  severity: "BLOCKER" | "HIGH";
  url: string;
  path: string;
  page_type: string;
  issue_class: string;
  issue_subclass: string;
  rendered_excerpt: string;
  image_path: string;
  root_cause: string;
  status: "OPEN";
};

type CrawlRow = {
  url: string;
  path: string;
  page_type: string;
  status: number | string;
  error: string;
  title: string;
  text_len: number;
  token_hits: string;
  has_token: boolean;
  has_machine: boolean;
  decision_machine: boolean;
  decision_broken: boolean;
  image_fail: string;
  image_count: number;
  excerpt: string;
};

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(name: string, rows: Record<string, unknown>[], cols: string[]) {
  mkdirSync(OUT, { recursive: true });
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => csvEscape(r[c])).join(","));
  writeFileSync(join(OUT, name), `${lines.join("\n")}\n`);
}

function excerpt(text: string, max = 220): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function pageTypeOf(path: string): string {
  if (path === "/") return "homepage";
  if (path === "/running/shoes/database") return "database";
  if (path.startsWith("/reviews/")) return "review";
  if (path.endsWith("/alternatives")) return "alternatives";
  if (path.startsWith("/products/")) return "product";
  if (path.startsWith("/best/")) return "best-guide";
  if (path.startsWith("/guides/")) return "buying-guide";
  if (path.startsWith("/compare/")) return "comparison";
  if (path.startsWith("/brands/")) return "brand";
  if (path.startsWith("/tools/") || path.startsWith("/finders/")) return "finder";
  if (path === "/running") return "sport-hub";
  if (path === "/running/shoes") return "category";
  if (path === "/running/watches" || path === "/running/gps-watches") {
    return "category";
  }
  if (["/running", "/padel", "/tennis", "/fitness"].includes(path)) {
    return "sport-hub";
  }
  return "other";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    );
}

function visibleText(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

function titleOf(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]!).replace(/\s+/g, " ").trim() : "";
}

function extractImageSrcs(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(/src="([^"]+)"/gi)) {
    const raw = decodeEntities(m[1]!);
    if (raw.startsWith("/images/")) found.add(normalizeSrc(raw.split("?")[0]!));
  }
  for (const m of html.matchAll(/(?:srcset|content)="([^"]+)"/gi)) {
    const blob = decodeEntities(m[1]!);
    for (const part of blob.split(",")) {
      const url = part.trim().split(/\s+/)[0] ?? "";
      if (url.startsWith("/images/")) found.add(normalizeSrc(url.split("?")[0]!));
      const q = url.match(/[?&]url=([^&]+)/);
      if (q) {
        try {
          const decoded = decodeURIComponent(q[1]!);
          if (decoded.startsWith("/images/")) found.add(normalizeSrc(decoded));
        } catch {
          /* ignore */
        }
      }
    }
  }
  for (const m of html.matchAll(/url=(%2Fimages%2F[^&"]+)/gi)) {
    try {
      const decoded = decodeURIComponent(m[1]!);
      if (decoded.startsWith("/images/")) found.add(normalizeSrc(decoded));
    } catch {
      /* ignore */
    }
  }
  const og = html.match(
    /property="og:image"[^>]*content="([^"]+)"|content="([^"]+)"[^>]*property="og:image"/i,
  );
  const ogSrc = og?.[1] ?? og?.[2];
  if (ogSrc) {
    try {
      const u = ogSrc.startsWith("http")
        ? new URL(ogSrc).pathname
        : ogSrc;
      if (u.startsWith("/images/")) found.add(normalizeSrc(u.split("?")[0]!));
    } catch {
      /* ignore */
    }
  }
  return [...found];
}

function detectNames(
  text: string,
  specs: Array<{ name: string; re: RegExp }>,
): string[] {
  return specs.filter((s) => s.re.test(text)).map((s) => s.name);
}

function extractDecisionLines(html: string): string[] {
  const vis = visibleText(html);
  const lines: string[] = [];
  const labels = [
    "Best for",
    "Not ideal for",
    "Buy if",
    "Skip if",
    "Who it's for",
    "Who should skip",
  ];
  for (const label of labels) {
    const idx = vis.toLowerCase().indexOf(label.toLowerCase());
    if (idx < 0) continue;
    const window = vis.slice(idx, idx + 700);
    for (const sent of window.split(/(?<=[.!?])\s+/)) {
      const t = sent.trim();
      if (t.split(/\s+/).length >= 5 && t.split(/\s+/).length <= 40) {
        lines.push(t);
      }
    }
  }
  return [...new Set(lines)];
}

function knownFillerFail(
  src: string,
  topic: string,
  path: string,
  title: string,
): string | undefined {
  const n = normalizeSrc(src);
  const hay = `${path} ${title}`.toLowerCase();
  if (n === "/images/home/guide-how-to-choose.jpg") {
    if (!/padel/.test(topic) && !/padel/.test(hay)) {
      return "padel_running_watch_image";
    }
  }
  if (n === "/images/brands/heroes/urban-dusk.jpg") {
    if (/watch|gps|forerunner|fenix/.test(hay) || topic === "gps_watches") {
      return "skyline_watch_guide";
    }
  }
  if (n === "/images/home/guide-running-shoes.jpg") {
    if (
      topic === "padel_rackets" ||
      topic === "tennis_rackets" ||
      topic === "fitness"
    ) {
      return "running_shoe_cross_sport";
    }
  }
  if (n === "/images/home/guide-tennis.jpg" && !/tennis/.test(topic) && !/tennis/.test(hay)) {
    return "tennis_cross_sport";
  }
  return undefined;
}

function homepageWatchPadel(html: string, srcs: string[]): boolean {
  const vis = visibleText(html).toLowerCase();
  const hasWatchCard = /how to choose a running watch|choose a running watch/.test(
    vis,
  );
  return (
    hasWatchCard &&
    srcs.some((s) => normalizeSrc(s) === "/images/home/guide-how-to-choose.jpg")
  );
}

function homepageWatchSkyline(html: string, srcs: string[]): boolean {
  const vis = visibleText(html).toLowerCase();
  const hasWatch =
    /running watch|gps watch|best running watches/.test(vis);
  return (
    hasWatch &&
    srcs.some((s) => normalizeSrc(s) === "/images/brands/heroes/urban-dusk.jpg")
  );
}

function wrongProductHero(path: string, src: string): boolean {
  const m = path.match(/^\/(products|reviews)\/([^/]+)/);
  if (!m) return false;
  if (!/\/products\//.test(src)) return false;
  const slug = m[2]!;
  if (src.includes(`/products/${slug}/`)) return false;
  const slugTok = slug.replace(/[^a-z0-9]+/gi, "");
  const file = src.split("/").pop() ?? "";
  const stem = file
    .replace(/-hero\.(jpg|png|webp)$/i, "")
    .replace(/\.(jpg|png|webp)$/i, "");
  const stemTok = stem.replace(/[^a-z0-9]+/gi, "");
  const stemTail = stemTok.replace(/^(sc|nb|ua)/, "");
  if (stemTail.length >= 6 && slugTok.includes(stemTail)) return false;
  const folder = src.split("/products/")[1]?.split("/")[0] ?? "";
  const folderTok = folder.replace(/[^a-z0-9]+/gi, "");
  const folderTail = folderTok.replace(/^(sc|nb|ua)/, "");
  if (folderTail.length >= 6 && slugTok.includes(folderTail)) return false;
  if (stem.length < 8) return false;
  return (
    !stemTok.includes(slugTok.slice(0, 8)) &&
    !slugTok.includes(stemTok.slice(0, 8))
  );
}

async function fetchHtml(
  path: string,
): Promise<{ status: number; html: string; error: string }> {
  const url = `${BASE}${path === "/" ? "/" : path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "kitletics-rendered-quality-audit/1.0" },
      redirect: "follow",
    });
    const html = await res.text();
    return { status: res.status, html, error: "" };
  } catch (err) {
    return {
      status: 0,
      html: "",
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(t);
  }
}

async function mapPool<T, R>(
  items: T[],
  n: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]!, idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

async function main() {
  console.log(`Crawl base ${BASE}`);
  const inventory = sitemap().map((e) => {
    const u = new URL(e.url);
    return { url: e.url, path: u.pathname || "/" };
  });
  inventory.sort((a, b) => a.path.localeCompare(b.path));
  console.log(`Canonical sitemap inventory: ${inventory.length} URLs`);

  const health = await fetchHtml("/");
  if (health.status !== 200) {
    console.error(`Homepage ${health.status} ${health.error}`);
    process.exit(2);
  }

  const issues: Issue[] = [];
  const rows: CrawlRow[] = [];
  let done = 0;
  const started = Date.now();

  await mapPool(inventory, CONCURRENCY, async (entry) => {
    const pageType = pageTypeOf(entry.path);
    let fetched = await fetchHtml(entry.path);
    if (fetched.status === 0) fetched = await fetchHtml(entry.path);
    const html = fetched.html;
    const vis = visibleText(html);
    const title = titleOf(html);
    const tokenHits = [
      ...detectNames(vis, TOKEN_RES),
      ...inspectPublicContentCorruption(vis),
    ];
    const uniqueTokens = [...new Set(tokenHits)];
    const machineHits = detectNames(vis, MACHINE_RES);
    const decisionLines = extractDecisionLines(html);
    const decisionClasses = decisionLines.map((l) => classifyDecisionLine(l));
    const decisionMachine = decisionClasses.includes("MACHINE_LIKE");
    const decisionBroken = decisionClasses.includes("BROKEN");
    const srcs = extractImageSrcs(html);
    const topic = inferEditorialTopic({
      slug: entry.path,
      title: `${title} ${vis.slice(0, 180)}`,
    });

    const imageFails: string[] = [];
    const isHome = entry.path === "/";
    if (isHome && homepageWatchPadel(html, srcs)) {
      imageFails.push("WRONG_SPORT:homepage_watch_padel");
    }
    if (isHome && homepageWatchSkyline(html, srcs)) {
      imageFails.push("WRONG_SPORT:homepage_watch_skyline");
    }
    if (
      /watch|gps/.test(entry.path) &&
      srcs.some((s) => normalizeSrc(s) === "/images/brands/heroes/urban-dusk.jpg")
    ) {
      imageFails.push("WRONG_SPORT:skyline_watch_guide");
    }

    const primarySrcs = isHome
      ? srcs
      : srcs.filter(
          (s) =>
            /hero|methodology|guide-|best-hub|urban-dusk|guide-how|guide-running|guide-tennis/.test(
              s,
            ) || s === srcs[0],
        );

    for (const src of srcs) {
      const filler = knownFillerFail(src, topic, entry.path, title);
      if (filler) imageFails.push(`WRONG_SPORT:${filler}:${src}`);
      if (wrongProductHero(entry.path, src)) {
        imageFails.push(`WRONG_PRODUCT:${src}`);
      }
    }
    if (!isHome) {
      for (const src of primarySrcs) {
        const cls = classifySemanticPlacement({
          src,
          slug: entry.path,
          title,
          placement:
            /methodology/.test(src) ? "methodology" : "hero",
        });
        if (isIndexableSemanticFail(cls.class) && cls.class !== "UNKNOWN") {
          imageFails.push(`${cls.class}:${src}:${cls.reason}`);
        }
      }
    }

    const uniqueImageFails = [...new Set(imageFails)];

    if (uniqueTokens.length) {
      issues.push({
        issue_id: "RQ-PENDING",
        severity: "BLOCKER",
        url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
        path: entry.path,
        page_type: pageType,
        issue_class: "TOKEN_LEAK",
        issue_subclass: uniqueTokens.join("|"),
        rendered_excerpt: excerpt(vis),
        image_path: "",
        root_cause: "Visible HTML contains uniqueness/internal tokens",
        status: "OPEN",
      });
    }
    if (decisionMachine) {
      const bad = decisionLines.filter(
        (l) => classifyDecisionLine(l) === "MACHINE_LIKE",
      )[0];
      issues.push({
        issue_id: "RQ-PENDING",
        severity: "BLOCKER",
        url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
        path: entry.path,
        page_type: pageType,
        issue_class: "DECISION_COPY",
        issue_subclass: "MACHINE_LIKE",
        rendered_excerpt: excerpt(bad ?? vis),
        image_path: "",
        root_cause: "Rendered decision copy classified MACHINE_LIKE",
        status: "OPEN",
      });
    }
    if (decisionBroken) {
      const bad = decisionLines.filter(
        (l) => classifyDecisionLine(l) === "BROKEN",
      )[0];
      issues.push({
        issue_id: "RQ-PENDING",
        severity: "BLOCKER",
        url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
        path: entry.path,
        page_type: pageType,
        issue_class: "DECISION_COPY",
        issue_subclass: "BROKEN",
        rendered_excerpt: excerpt(bad ?? vis),
        image_path: "",
        root_cause: "Rendered decision copy classified BROKEN",
        status: "OPEN",
      });
    }
    if (machineHits.length && !decisionMachine && !decisionBroken) {
      issues.push({
        issue_id: "RQ-PENDING",
        severity: "HIGH",
        url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
        path: entry.path,
        page_type: pageType,
        issue_class: "MACHINE_COPY_BODY",
        issue_subclass: machineHits.join("|"),
        rendered_excerpt: excerpt(vis),
        image_path: "",
        root_cause: "Visible HTML matches uniqueness-era machine templates",
        status: "OPEN",
      });
    }
    for (const fail of uniqueImageFails) {
      const [cls, ...rest] = fail.split(":");
      issues.push({
        issue_id: "RQ-PENDING",
        severity: "BLOCKER",
        url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
        path: entry.path,
        page_type: pageType,
        issue_class: "IMAGE_SEMANTIC",
        issue_subclass: cls ?? fail,
        rendered_excerpt: excerpt(title),
        image_path: rest.join(":"),
        root_cause: fail,
        status: "OPEN",
      });
    }

    rows.push({
      url: `${BASE}${entry.path === "/" ? "" : entry.path}`,
      path: entry.path,
      page_type: pageType,
      status: fetched.status || "ERR",
      error: fetched.error,
      title,
      text_len: vis.length,
      token_hits: uniqueTokens.join("|"),
      has_token: uniqueTokens.length > 0,
      has_machine: machineHits.length > 0,
      decision_machine: decisionMachine,
      decision_broken: decisionBroken,
      image_fail: uniqueImageFails.join("|"),
      image_count: srcs.length,
      excerpt: excerpt(vis, 160),
    });

    done += 1;
    if (done % 100 === 0) {
      process.stdout.write(
        `  crawled ${done}/${inventory.length} (${Date.now() - started}ms)\n`,
      );
    }
  });

  rows.sort((a, b) => a.path.localeCompare(b.path));
  issues.sort((a, b) => a.path.localeCompare(b.path) || a.issue_class.localeCompare(b.issue_class));
  issues.forEach((issue, i) => {
    issue.issue_id = `RQ-${String(i + 1).padStart(5, "0")}`;
  });

  writeCsv(
    "REMEDIATION-HTML-CRAWL.csv",
    rows as unknown as Record<string, unknown>[],
    [
      "url",
      "path",
      "page_type",
      "status",
      "error",
      "title",
      "text_len",
      "token_hits",
      "has_token",
      "has_machine",
      "decision_machine",
      "decision_broken",
      "image_fail",
      "image_count",
      "excerpt",
    ],
  );
  writeCsv(
    "REMEDIATION-REMAINING-ISSUES.csv",
    issues as unknown as Record<string, unknown>[],
    [
      "issue_id",
      "severity",
      "url",
      "path",
      "page_type",
      "issue_class",
      "issue_subclass",
      "rendered_excerpt",
      "image_path",
      "root_cause",
      "status",
    ],
  );

  const tokenUrls = rows.filter((r) => r.has_token).length;
  const concatUrls = rows.filter((r) =>
    /concatenated_token/.test(r.token_hits),
  ).length;
  const skuUrls = rows.filter((r) => /skuslug|skuid/.test(r.token_hits)).length;
  const machineHtml = rows.filter((r) => r.has_machine).length;
  const decisionMachine = rows.filter((r) => r.decision_machine).length;
  const decisionBroken = rows.filter((r) => r.decision_broken).length;
  const imageUrls = rows.filter((r) => r.image_fail).length;
  const httpFail = rows.filter((r) => r.status !== 200).length;
  const affected = new Set(
    issues.filter((i) => i.severity === "BLOCKER").map((i) => i.path),
  ).size;

  const summary = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    sitemapUrls: inventory.length,
    crawled: rows.length,
    httpNot200: httpFail,
    tokenLeakUrls: tokenUrls,
    concatenatedTokenUrls: concatUrls,
    skuslugSkuidUrls: skuUrls,
    htmlMachineCopyUrls: machineHtml,
    decisionMachineLikeUrls: decisionMachine,
    decisionBrokenUrls: decisionBroken,
    imageIssueUrls: imageUrls,
    blockerUrls: affected,
    remainingIssues: issues.length,
    homepageWatchPadel: rows.some((r) =>
      r.image_fail.includes("homepage_watch_padel"),
    ),
    homepageWatchSkyline: rows.filter((r) =>
      /watch/.test(r.path) || r.path === "/",
    ).some((r) => /skyline|urban-dusk/.test(r.image_fail)),
  };
  writeFileSync(
    join(OUT, "REMEDIATION-HTML-CRAWL-SUMMARY.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
