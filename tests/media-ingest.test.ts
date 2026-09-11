import { createRequire } from "node:module";
import { mkdtempSync, readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  assessMediaIngest,
  assessPublicMediaPath,
  MEDIA_INGEST_POLICY,
} from "@/lib/media/ingest-policy";
import { writeWebMaster } from "../scripts/lib/media-ingest.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

function walkOverError(dir: string, cap: number, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walkOverError(p, cap, acc);
    } else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(name) && st.size > cap) {
      acc.push(p);
    }
  }
  return acc;
}

function walkForbiddenPublicPaths(
  dir: string,
  acc: string[] = [],
): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "qa") acc.push(p);
      walkForbiddenPublicPaths(p, acc);
    } else {
      const assess = assessPublicMediaPath(p);
      if (assess.level === "error") acc.push(p);
    }
  }
  return acc;
}

describe("media ingest policy", () => {
  it("accepts a 1200px JPEG under 1MB", () => {
    const a = assessMediaIngest({
      bytes: 400_000,
      width: 1200,
      height: 1200,
      format: "jpeg",
      hasAlpha: false,
      role: "hero",
    });
    expect(a.level).toBe("ok");
  });

  it("warns above 1MB or over the role edge without rejecting", () => {
    const a = assessMediaIngest({
      bytes: 1.5 * 1024 * 1024,
      width: 2400,
      height: 2400,
      format: "jpeg",
      role: "hero",
    });
    expect(a.level).toBe("warn");
  });

  it("errors above 5MB or 4000px", () => {
    expect(
      assessMediaIngest({ bytes: 6 * 1024 * 1024, width: 1600, height: 1600 })
        .level,
    ).toBe("error");
    expect(
      assessMediaIngest({ bytes: 200_000, width: 4001, height: 4001 }).level,
    ).toBe("error");
  });

  it("errors on backup / QA / wrong-brand public paths", () => {
    expect(
      assessPublicMediaPath("public/images/running/products/x.WRONG-y.png.bak")
        .level,
    ).toBe("error");
    expect(
      assessPublicMediaPath("public/images/brands/qa/hub-1440.png").level,
    ).toBe("error");
    expect(
      assessPublicMediaPath("public/images/padel/qa-padel-1440.png").level,
    ).toBe("error");
    expect(
      assessPublicMediaPath(
        "public/images/running/products/nike-vomero-18-fit.png",
      ).level,
    ).toBe("error");
    expect(
      assessPublicMediaPath(
        "public/images/running/products/nike-vomero-18/sections/fit.png",
      ).level,
    ).toBe("ok");
  });

  it("warns oversized opaque review-section PNGs", () => {
    const a = assessMediaIngest({
      bytes: 1.5 * 1024 * 1024,
      width: 1000,
      height: 1000,
      format: "png",
      hasAlpha: false,
      role: "section",
      path: "public/images/running/products/demo/sections/fit.png",
    });
    expect(a.level).toBe("warn");
    expect(a.reasons.some((r) => /opaque|JPEG|section/i.test(r))).toBe(true);
  });

  it("shares thresholds with writeWebMaster", async () => {
    const { MEDIA_INGEST_POLICY: fromMjs } = await import(
      "../scripts/lib/media-ingest.mjs"
    );
    expect(fromMjs.errorBytes).toBe(MEDIA_INGEST_POLICY.errorBytes);
    expect(fromMjs.heroMaxEdgePx).toBe(MEDIA_INGEST_POLICY.heroMaxEdgePx);
  });
});

describe("writeWebMaster", () => {
  it("flattens a transparent PNG to a JPEG within gallery limits", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kit-ingest-"));
    try {
      const png = await sharp({
        create: {
          width: 800,
          height: 800,
          channels: 4,
          background: { r: 20, g: 40, b: 80, alpha: 0.5 },
        },
      })
        .png()
        .toBuffer();
      const dest = join(dir, "cutout.png");
      const written = await writeWebMaster(png, dest, { role: "gallery" });
      expect(written.format).toBe("jpeg");
      expect(written.dest.endsWith(".jpg")).toBe(true);
      expect(written.bytes).toBeLessThan(MEDIA_INGEST_POLICY.warnBytes);
      expect(Math.max(written.width ?? 0, written.height ?? 0)).toBeLessThanOrEqual(
        MEDIA_INGEST_POLICY.galleryMaxEdgePx,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("production public/images", () => {
  it("has no catalog masters above the 5MB error threshold", () => {
    const hits = walkOverError(
      join(process.cwd(), "public/images"),
      MEDIA_INGEST_POLICY.errorBytes,
    );
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("has no QA / backup / wrong-brand clutter paths", () => {
    const hits = walkForbiddenPublicPaths(join(process.cwd(), "public/images"));
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
