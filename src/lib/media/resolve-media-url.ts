/**
 * Resolve catalog/media paths for environments that host files on Vercel Blob.
 * Content keeps relative `/images/...` paths; production rewrites (middleware /
 * next.config) proxy them. This helper is for callers that need an absolute URL
 * (OG tags, external embeds).
 */
export function resolveMediaUrl(src: string | undefined | null): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL?.replace(/\/$/, "");
  if (base && src.startsWith("/images/")) {
    return `${base}${src}`;
  }
  return src;
}
