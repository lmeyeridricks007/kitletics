import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertUniqueHeroBytes,
  preferManufacturerRemotes,
  sha256Hex,
} from "../scripts/lib/hero-download.mjs";

describe("hero-download helpers", () => {
  it("prefers manufacturer CDNs over RunRepeat re-hosts", () => {
    const sorted = preferManufacturerRemotes([
      "https://www.runrepeat.com/product_primary/foo.jpg",
      "https://static.nike.com/a/b/hero.jpg",
      "https://cdn.shopify.com/s/files/1/x/y.jpg",
    ]);
    expect(sorted[0]).toContain("static.nike.com");
    expect(sorted.at(-1)).toContain("runrepeat.com");
  });

  it("rejects buffers that match another on-disk hero", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hero-dl-"));
    const publicDir = path.join(tmp, "public/images/training/products");
    fs.mkdirSync(publicDir, { recursive: true });
    const existing = path.join(publicDir, "shoe-a-hero.jpg");
    const bytes = Buffer.from("unique-hero-bytes-for-collision-test-1234567890");
    fs.writeFileSync(existing, bytes);

    expect(() =>
      assertUniqueHeroBytes(bytes, {
        root: tmp,
        excludeSrc: undefined,
        label: "shoe-b",
      }),
    ).toThrow(/shared-hero hash collision/);

    // Same path exclude is allowed (re-download of self)
    expect(
      assertUniqueHeroBytes(bytes, {
        root: tmp,
        excludeSrc: "/images/training/products/shoe-a-hero.jpg",
        label: "shoe-a",
      }),
    ).toBe(sha256Hex(bytes));
  });
});
