/**
 * Resolve catalog/media paths for environments that host files on Vercel Blob.
 * Content keeps relative `/images/...` paths; the `/images` rewrite remains
 * for legacy URLs, OG tags, and crawlers.
 *
 * next/image catalog sources use the public Blob origin only when
 * `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL` is set — the same value on server and
 * client — so RSC HTML and client hydration cannot disagree. Server-only
 * `MEDIA_BLOB_BASE_URL` stays on the next.config rewrite for `/images/*`.
 */
function mediaBlobPublicBase(): string | undefined {
  return process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL?.replace(/\/$/, "") || undefined;
}

/** Direct Blob URL for known `/images/...` assets; otherwise the original src. */
export function resolveProductImageSource(
  src: string | undefined | null,
): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = mediaBlobPublicBase();
  if (base && src.startsWith("/images/")) {
    return `${base}${src}`;
  }
  return src;
}

/**
 * Absolute URL for OG tags and external embeds. Delegates to
 * `resolveProductImageSource` so Blob mapping stays in one place.
 */
export function resolveMediaUrl(src: string | undefined | null): string {
  return resolveProductImageSource(src);
}
