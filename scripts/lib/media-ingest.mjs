/**
 * Catalog media ingest: write a web master that respects
 * src/lib/media/ingest-policy.json. Call this instead of writing raw CDN
 * buffers into public/.
 *
 * Does not reject licensed photography — it resizes / flattens / JPEG-encodes
 * so extreme PNG masters never enter the production tree.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const POLICY = JSON.parse(
  fs.readFileSync(
    fileURLToPath(
      new URL("../../src/lib/media/ingest-policy.json", import.meta.url),
    ),
    "utf8",
  ),
);

export const MEDIA_INGEST_POLICY = POLICY;

function roleMaxEdge(role = "hero") {
  if (role === "gallery") return POLICY.galleryMaxEdgePx;
  return POLICY.heroMaxEdgePx;
}

function jpegDest(destPath) {
  return destPath.replace(/\.(png|webp|avif|gif)$/i, ".jpg");
}

function parseFlatten() {
  const hex = String(POLICY.flattenBackground || "#ffffff").replace("#", "");
  const n = Number.parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Write a production web master from a downloaded buffer.
 * Opaque / cut-out product photos flatten onto white and encode as JPEG.
 *
 * @param {Buffer} buf
 * @param {string} destPath intended path under public/ (extension may change to .jpg)
 * @param {{ role?: "hero" | "gallery" | "other" }} [opts]
 */
export async function writeWebMaster(buf, destPath, { role = "hero" } = {}) {
  const normalized = String(destPath).replace(/\\/g, "/");
  const forbidden = POLICY.forbiddenPathSubstrings || [];
  for (const frag of forbidden) {
    if (normalized.includes(frag)) {
      throw new Error(
        `media-ingest: refusing to write forbidden public path fragment "${frag}": ${destPath}`,
      );
    }
  }
  const maxEdge = roleMaxEdge(role);
  const meta = await sharp(buf).rotate().metadata();
  const edge = Math.max(meta.width || 0, meta.height || 0);
  const format = (meta.format || "").toLowerCase();
  const alreadyFits =
    buf.length <= POLICY.warnBytes &&
    edge <= maxEdge &&
    format !== "png" &&
    !meta.hasAlpha;

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (alreadyFits) {
    const keep = destPath;
    fs.writeFileSync(keep, buf);
    return {
      dest: keep,
      bytes: buf.length,
      width: meta.width,
      height: meta.height,
      format: format === "jpeg" ? "jpeg" : format,
      rewritten: false,
    };
  }

  let pipeline = sharp(buf).rotate().resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });
  if (meta.hasAlpha) {
    pipeline = pipeline.flatten({ background: parseFlatten() });
  }
  const out = await pipeline
    .jpeg({ quality: POLICY.jpegQuality, mozjpeg: true })
    .toBuffer();
  const dest = jpegDest(destPath);
  fs.writeFileSync(dest, out);
  const outMeta = await sharp(out).metadata();
  return {
    dest,
    bytes: out.length,
    width: outMeta.width,
    height: outMeta.height,
    format: "jpeg",
    rewritten: true,
    original: {
      bytes: buf.length,
      width: meta.width,
      height: meta.height,
      format: meta.format,
      hasAlpha: Boolean(meta.hasAlpha),
    },
  };
}
