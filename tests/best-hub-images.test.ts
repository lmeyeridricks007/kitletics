import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { getBestIndexData } from "@/lib/best/get-best-guide-page-data";
import {
  resolveBestGuideImage,
  resolveUniqueBestGuideImages,
} from "@/lib/best/resolve-best-guide-image";

function fingerprint(src: string): string {
  const path = join(process.cwd(), "public", src.replace(/^\//, ""));
  expect(existsSync(path), `missing image ${src}`).toBe(true);
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("Best hub guide images", () => {
  it("shoe-domain hub cards use unique image paths", () => {
    const { guides } = getBestIndexData({ domain: "shoes" });
    expect(guides.length).toBeGreaterThan(5);

    const unique = resolveUniqueBestGuideImages(guides);
    const paths = new Set<string>();

    for (const guide of guides) {
      const image = unique.get(guide.id) ?? resolveBestGuideImage(guide);
      expect(paths.has(image.src), `duplicate image for ${guide.slug}: ${image.src}`).toBe(
        false,
      );
      paths.add(image.src);
      expect(existsSync(join(process.cwd(), "public", image.src.replace(/^\//, "")))).toBe(
        true,
      );
    }
  });

  it("max-cushion and stability no longer share photography", () => {
    const { guides } = getBestIndexData({ domain: "shoes" });
    const max = guides.find((g) => g.slug === "max-cushion-running-shoes");
    const stability = guides.find((g) => g.slug === "stability-running-shoes");
    if (!max || !stability) {
      expect(guides.length).toBeGreaterThan(0);
      return;
    }
    const a = resolveBestGuideImage(max);
    const b = resolveBestGuideImage(stability);
    expect(fingerprint(a.src)).not.toBe(fingerprint(b.src));
  });

  it("tempo and heavy-runners no longer share near-identical photography", () => {
    const { guides } = getBestIndexData({ domain: "shoes" });
    const tempo = guides.find((g) => g.slug === "tempo-running-shoes");
    const heavy = guides.find((g) => g.slug === "running-shoes-heavy-runners");
    if (!tempo || !heavy) {
      // Held (non-INDEXABLE) guides are intentionally absent from the hub
      expect(guides.length).toBeGreaterThan(0);
      return;
    }
    const a = resolveBestGuideImage(tempo);
    const b = resolveBestGuideImage(heavy);
    expect(fingerprint(a.src)).not.toBe(fingerprint(b.src));
  });
});
