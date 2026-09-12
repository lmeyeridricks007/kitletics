/**
 * Extract visible consumer strings and image srcs from assembled page data.
 * Walks buyer-facing fields only — not the full product graph.
 */

import type { CanonicalDecisionCopy } from "@/lib/decision-copy/types";
import type { VisibleComponent, VisibleImage } from "./types";

const TEXT_KEY =
  /^(title|name|fullName|displayTitle|summary|verdict|bottomLine|body|heading|description|subtitle|shortDescription|quickAnswer|deck|intro|whyText|why|whyRecommended|whyAlternative|whoShouldSwitch|whoShouldStay|methodology|testingContext|editorialDisclosure|bestFor|notIdealFor|buyIf|skipIf|pros|cons|whoShouldBuy|whoShouldAvoid|strengths|compromises|weaknesses|label|text|caption|alt|imageAlt|explanation|rationale|note|headlineLead|headlineAccent|accentPhrase)$/i;

const IMAGE_KEY =
  /^(src|imageSrc|heroImageSrc|methodologyImageSrc|heroBackgroundSrc)$/;

const SKIP_RECURSE = new Set([
  "product",
  "products",
  "family",
  "familyMembers",
  "specifications",
  "specDefs",
  "specGroups",
  "offers",
  "offersOtherRegions",
  "evidence",
  "faqs",
  "breadcrumbs",
  "records",
  "dataExplorer",
  "variants",
  "sports",
  "subcategories",
]);
const MAX_COMPONENTS = 120;
const MAX_IMAGES = 40;
const MAX_DEPTH = 8;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function excerpt(text: string, max = 220): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function joinVisible(components: VisibleComponent[]): string {
  return components.map((c) => c.text).filter(Boolean).join("\n\n");
}

function pushText(
  components: VisibleComponent[],
  seen: Set<string>,
  path: string,
  value: string,
): void {
  if (components.length >= MAX_COMPONENTS) return;
  const t = value.replace(/\s+/g, " ").trim();
  if (t.length < 4) return;
  if (t.startsWith("/") && !/\s/.test(t)) return;
  if (/^(prod|rev|uc|ev|cat|sku)-[a-z0-9-]+$/i.test(t)) return;
  if (seen.has(t)) return;
  seen.add(t);
  components.push({ id: path, text: t });
}

export function flattenVisible(
  input: unknown,
  componentPrefix = "page",
): {
  components: VisibleComponent[];
  images: VisibleImage[];
} {
  const components: VisibleComponent[] = [];
  const images: VisibleImage[] = [];
  const seenText = new Set<string>();
  const seenSrc = new Set<string>();

  const walk = (node: unknown, path: string, depth: number) => {
    if (node == null || depth > MAX_DEPTH) return;
    if (components.length >= MAX_COMPONENTS && images.length >= MAX_IMAGES) return;

    if (typeof node === "string") {
      // Only keep free-floating strings when we arrived via a consumer key
      // (handled below). Bare strings from unknown keys are ignored.
      return;
    }
    if (typeof node === "number" || typeof node === "boolean") return;
    if (Array.isArray(node)) {
      if (node.every((x) => typeof x === "string")) {
        for (let i = 0; i < node.length; i++) {
          pushText(components, seenText, `${path}[${i}]`, node[i] as string);
        }
        return;
      }
      node.forEach((item, i) => walk(item, `${path}[${i}]`, depth + 1));
      return;
    }
    if (!isPlainObject(node)) return;

    const src = typeof node.src === "string" ? node.src : undefined;
    const imageSrc = typeof node.imageSrc === "string" ? node.imageSrc : undefined;
    const hit = src ?? imageSrc;
    if (hit && !seenSrc.has(hit) && images.length < MAX_IMAGES) {
      seenSrc.add(hit);
      const alt =
        typeof node.alt === "string"
          ? node.alt
          : typeof node.imageAlt === "string"
            ? node.imageAlt
            : undefined;
      images.push({
        src: hit,
        alt,
        component: path,
        placement: /hero|methodology/i.test(path) ? "hero" : "card",
      });
    }

    for (const [key, value] of Object.entries(node)) {
      if (IMAGE_KEY.test(key) && typeof value === "string") {
        if (!seenSrc.has(value) && images.length < MAX_IMAGES) {
          seenSrc.add(value);
          images.push({
            src: value,
            alt: typeof node.alt === "string" ? node.alt : undefined,
            component: `${path}.${key}`,
            placement: /methodology/i.test(key)
              ? "methodology"
              : /hero/i.test(key)
                ? "hero"
                : "card",
          });
        }
        continue;
      }
      if (typeof value === "string" && TEXT_KEY.test(key)) {
        pushText(components, seenText, `${path}.${key}`, value);
        continue;
      }
      if (Array.isArray(value) && value.every((x) => typeof x === "string") && TEXT_KEY.test(key)) {
        value.forEach((s, i) =>
          pushText(components, seenText, `${path}.${key}[${i}]`, s),
        );
        continue;
      }
      if (value && typeof value === "object") {
        if (SKIP_RECURSE.has(key) && isPlainObject(value)) {
          const name =
            typeof value.fullName === "string"
              ? value.fullName
              : typeof value.name === "string"
                ? value.name
                : undefined;
          if (name) pushText(components, seenText, `${path}.${key}.name`, name);
          if (typeof value.src === "string") {
            walk({ src: value.src, alt: value.alt }, `${path}.${key}`, depth + 1);
          }
          continue;
        }
        walk(value, `${path}.${key}`, depth + 1);
      }
    }
  };

  walk(input, componentPrefix, 0);
  return { components, images };
}

export function decisionFromUnknown(
  data: unknown,
): CanonicalDecisionCopy | undefined {
  if (!isPlainObject(data)) return undefined;
  const dc = data.decisionCopy;
  if (isPlainObject(dc) && Array.isArray(dc.buyIf) && Array.isArray(dc.skipIf)) {
    return {
      bestFor: (dc.bestFor as string[]) ?? [],
      notIdealFor: (dc.notIdealFor as string[]) ?? [],
      buyIf: (dc.buyIf as string[]) ?? [],
      skipIf: (dc.skipIf as string[]) ?? [],
      pros: (dc.pros as string[]) ?? [],
      cons: (dc.cons as string[]) ?? [],
    };
  }
  const bestFor = Array.isArray(data.bestFor) ? (data.bestFor as string[]) : [];
  const notIdealFor = Array.isArray(data.notIdealFor)
    ? (data.notIdealFor as string[])
    : [];
  const buyIf = Array.isArray(data.buyIf) ? (data.buyIf as string[]) : [];
  const skipIf = Array.isArray(data.skipIf) ? (data.skipIf as string[]) : [];
  const pros = Array.isArray(data.pros) ? (data.pros as string[]) : [];
  const cons = Array.isArray(data.cons) ? (data.cons as string[]) : [];
  if (bestFor.length + buyIf.length + skipIf.length + pros.length === 0) {
    return undefined;
  }
  return { bestFor, notIdealFor, buyIf, skipIf, pros, cons };
}

export function addImage(
  images: VisibleImage[],
  src: string | undefined,
  component: string,
  placement: VisibleImage["placement"],
  alt?: string,
): void {
  if (!src) return;
  if (images.some((i) => i.src === src && i.component === component)) return;
  images.push({ src, alt, component, placement });
}
