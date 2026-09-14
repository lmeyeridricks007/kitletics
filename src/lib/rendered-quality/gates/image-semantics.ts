import {
  classifySemanticPlacement,
  isIndexableSemanticFail,
} from "@/lib/media/semantic-image/classify";
import { inferEditorialTopic, normalizeSrc } from "@/lib/media/semantic-image/subjects";
import { excerpt } from "../flatten";
import type { RenderedIssue, VisiblePage } from "../types";

const KNOWN_FILLERS: Array<{
  src: string;
  failUnlessTopic?: RegExp;
  onlyTopics?: string[];
  issue: string;
}> = [
  {
    src: "/images/home/guide-how-to-choose.jpg",
    failUnlessTopic: /padel/,
    issue: "padel_running_watch_image",
  },
  {
    src: "/images/home/guide-running-shoes.jpg",
    onlyTopics: ["padel_rackets", "tennis_rackets", "fitness"],
    issue: "running_shoe_cross_sport",
  },
  {
    src: "/images/home/guide-tennis.jpg",
    failUnlessTopic: /tennis/,
    issue: "tennis_cross_sport",
  },
  {
    src: "/images/brands/heroes/urban-dusk.jpg",
    failUnlessTopic: /mixed_home|unknown/,
    issue: "skyline_watch_guide",
  },
];

function topicHay(page: VisiblePage): { slug: string; title: string } {
  return {
    slug: `${page.path} ${page.entity.slug}`,
    title: page.components[0]?.text ?? page.entity.slug,
  };
}

function isPadelPage(page: VisiblePage): boolean {
  return /padel/i.test(`${page.path} ${page.entity.slug} ${page.entity.id}`);
}

/**
 * Hard padel cross-sport rejects — apply to every image on padel pages,
 * not only primary heroes (FlipBelt often lands on guide cards).
 */
function padelCrossSportIssue(
  page: VisiblePage,
  src: string,
): string | null {
  if (!isPadelPage(page)) return null;

  if (/flipbelt/i.test(src) || src.includes("/images/running/")) {
    return "padel_running_image";
  }
  if (src === "/images/home/guide-tennis.jpg") {
    return "tennis_cross_sport";
  }

  const padelProductOrGuide =
    page.template === "product" ||
    page.template === "review" ||
    page.template === "buying-guide" ||
    page.template === "best-guide" ||
    page.path.startsWith("/guides/") ||
    page.path.startsWith("/best/") ||
    page.path.startsWith("/products/") ||
    page.path.startsWith("/reviews/");

  if (
    padelProductOrGuide &&
    src.includes("/images/fitness/") &&
    /hero/i.test(src)
  ) {
    return "padel_fitness_namespace_hero";
  }

  return null;
}

function wrongProductCard(page: VisiblePage, src: string): boolean {
  if (page.template !== "product" && page.template !== "review") return false;
  if (!/\/products\//.test(src)) return false;
  const slug = page.entity.slug.replace(/-review$/, "");
  if (src.includes(`/products/${slug}/`)) return false;
  const folder = src.split("/products/")[1]?.split("/")[0] ?? "";
  const slugTok = slug.replace(/[^a-z0-9]+/gi, "");
  const folderTok = folder.replace(/[^a-z0-9]+/gi, "");
  if (folderTok.length >= 6 && slugTok.includes(folderTok)) return false;
  const folderTail = folderTok.replace(/^(sc|nb|ua)/, "");
  if (folderTail.length >= 6 && slugTok.includes(folderTail)) return false;
  const file = src.split("/").pop() ?? "";
  const stem = file
    .replace(/-hero\.(jpg|png|webp)$/i, "")
    .replace(/\.(jpg|png|webp)$/i, "");
  const stemTok = stem.replace(/[^a-z0-9]+/gi, "");
  if (stemTok === "overview" || /^(specs|fit|tech|value)$/.test(stemTok)) {
    return false;
  }
  const stemTail = stemTok.replace(/^(sc|nb|ua)/, "");
  if (stemTail.length >= 6 && slugTok.includes(stemTail)) return false;
  if (stem.length < 8 || slug.length < 6) return false;
  return (
    !stemTok.includes(slugTok.slice(0, 8)) &&
    !slugTok.includes(stemTok.slice(0, 8))
  );
}

function isPagePrimaryImage(image: VisiblePage["images"][number]): boolean {
  return (
    image.placement === "hero" ||
    image.placement === "methodology" ||
    image.placement === "primary" ||
    /hero|methodology/i.test(image.component)
  );
}

export function gateImageSemantics(
  pages: VisiblePage[],
  startId: number,
): RenderedIssue[] {
  const issues: RenderedIssue[] = [];
  let n = startId;
  for (const page of pages) {
    if (!page.assembled) continue;
    if (page.template === "homepage") continue;
    const topicInput = topicHay(page);
    for (const image of page.images) {
      const src = normalizeSrc(image.src);
      const topic = inferEditorialTopic({
        slug: topicInput.slug,
        title: `${topicInput.title} ${image.alt ?? ""}`,
      });

      const padelIssue = padelCrossSportIssue(page, src);
      if (padelIssue) {
        issues.push({
          id: `RQ-${String(++n).padStart(5, "0")}`,
          severity: "BLOCKER",
          gate: "image-semantics",
          issueClass: "IMAGE_SEMANTIC",
          issue: padelIssue,
          component: image.component,
          url: page.url,
          template: page.template,
          entity: page.entity,
          rootCause: `Padel page ${page.path} uses cross-sport image ${src}`,
          excerpt: excerpt(`${image.alt ?? ""} ${src}`),
        });
        continue;
      }

      const filler = KNOWN_FILLERS.find((f) => src === f.src);
      if (filler) {
        const allowedByTopic = filler.failUnlessTopic
          ? filler.failUnlessTopic.test(topic)
          : false;
        const onlyList = filler.onlyTopics;
        const fail = onlyList
          ? onlyList.includes(topic)
          : !allowedByTopic;
        if (fail) {
          issues.push({
            id: `RQ-${String(++n).padStart(5, "0")}`,
            severity: "BLOCKER",
            gate: "image-semantics",
            issueClass: "IMAGE_SEMANTIC",
            issue: filler.issue,
            component: image.component,
            url: page.url,
            template: page.template,
            entity: page.entity,
            rootCause: `Known wrong filler ${src} on ${page.path} (topic ${topic})`,
            excerpt: excerpt(`${image.alt ?? ""} ${src}`),
          });
        }
        continue;
      }

      if (wrongProductCard(page, src)) {
        issues.push({
          id: `RQ-${String(++n).padStart(5, "0")}`,
          severity: "BLOCKER",
          gate: "image-semantics",
          issueClass: "IMAGE_SEMANTIC",
          issue: "wrong_product_card",
          component: image.component,
          url: page.url,
          template: page.template,
          entity: page.entity,
          rootCause: `Product/review ${page.entity.slug} uses image ${src}`,
          excerpt: src,
        });
        continue;
      }

      if (!isPagePrimaryImage(image)) continue;
      if (topic === "unknown" || topic === "mixed_home") continue;

      const cls = classifySemanticPlacement({
        src,
        slug: topicInput.slug,
        title: topicInput.title,
        placement: image.placement === "section" ? "card" : image.placement,
      });
      if (!isIndexableSemanticFail(cls.class)) continue;
      issues.push({
        id: `RQ-${String(++n).padStart(5, "0")}`,
        severity: cls.class === "WRONG_SPORT" ? "BLOCKER" : "HIGH",
        gate: "image-semantics",
        issueClass: "IMAGE_SEMANTIC",
        issue: cls.class,
        component: image.component,
        url: page.url,
        template: page.template,
        entity: page.entity,
        rootCause: cls.reason,
        excerpt: excerpt(`${src} · ${cls.reason}`),
      });
    }
  }
  return issues;
}
