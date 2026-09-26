/**
 * Production media delivery contract for review/catalog images.
 *
 * `/public/images/**` is gitignored and hosted on Vercel Blob. Gallery packs and
 * education SVGs under that tree are often missing from Blob even when heroes
 * and section PNGs exist. Prefer authenticated remote `sourceUrl`s (or tracked
 * `/media/...` paths) so the UI never renders a broken `<img>`.
 */

/**
 * Hosts allowed for gallery→remote remapping. Must stay aligned with
 * `next.config.ts` `images.remotePatterns` — otherwise next/image fails closed.
 */
export const DELIVERABLE_REMOTE_HOSTS = new Set([
  "cdn.shopify.com",
  "contents.mediadecathlon.com",
  "allforpadel.com",
  "www.extreme-tennis.eu",
  "www.onlytenis.com",
  "www.zonadepadel.es",
  "au.wilson.com",
  "images.asics.com",
  "www.asics.com",
  "images.ctfassets.net",
  "img.runningwarehouse.com",
  "res.garmin.com",
  "cdn.runrepeat.com",
  "cdn11.bigcommerce.com",
  "staticcn.coros.com",
  "nb.scene7.com",
  "images.samsung.com",
  "media.eleiko.com",
  "images.prismic.io",
  "cdn.sportsshoes.com",
  "static.nike.com",
  "assets.tracksmith.com",
  "media.babolat.com",
  "eu.wahoofitness.com",
]);

export function isAllowedDeliverableRemoteUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    if (hostname.endsWith(".public.blob.vercel-storage.com")) return true;
    if (hostname.endsWith(".blob.vercel-storage.com")) return true;
    return DELIVERABLE_REMOTE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/** Local gallery packs under /images are frequently absent from Blob. */
export function isUndeployedLocalGalleryPath(src: string): boolean {
  return src.startsWith("/images/") && src.includes("/gallery/");
}

/**
 * Education diagrams under `/images/padel/education/` are gitignored with the
 * rest of `/public/images/**`. Canonical deployable copies live under `/media/`.
 */
export function isUndeployedLocalEducationPath(src: string): boolean {
  return (
    src.startsWith("/images/") &&
    (src.includes("/education/") || src.includes("/padel/education/"))
  );
}

/** Paths the review UI must not render as `<img src>`. */
export function isKnownUndeployablePublicImagePath(src: string): boolean {
  if (!src || typeof src !== "string") return true;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) {
    // Remote must be an allow-listed host; otherwise treat as undeployable.
    return !isAllowedDeliverableRemoteUrl(src);
  }
  if (src.startsWith("/media/")) return false;
  return (
    isUndeployedLocalGalleryPath(src) || isUndeployedLocalEducationPath(src)
  );
}

/**
 * True when this src is safe to put on next/image / <img> for public pages.
 * Does not prove remote HTTP 200 — only rejects known-broken local contracts
 * and unsupported remote hosts.
 */
export function isRenderableReviewMediaSrc(
  src: string | undefined | null,
): boolean {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (isKnownUndeployablePublicImagePath(trimmed)) return false;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith("/")) return true;
  return false;
}

/**
 * Prefer HTTPS sourceUrl when the catalog local path is a known-undeployable
 * gallery pack AND the remote host is next/image-allowlisted.
 * Keep local src when it is a Blob-backed hero/section path.
 */
export function resolveDeliverableMediaSrc(input: {
  src: string;
  sourceUrl?: string | null;
}): string {
  const local = input.src?.trim() ?? "";
  const remote = input.sourceUrl?.trim() ?? "";
  if (
    local &&
    isUndeployedLocalGalleryPath(local) &&
    isAllowedDeliverableRemoteUrl(remote)
  ) {
    return remote;
  }
  return local;
}

/**
 * Remap a MediaAsset to a public-deliverable src, or undefined when it would
 * render broken (undeployed gallery without an allow-listed remote).
 */
export function toDeliverableMediaAsset<T extends { src: string; sourceUrl?: string | null }>(
  asset: T,
): (T & { src: string }) | undefined {
  const src = resolveDeliverableMediaSrc({
    src: asset.src,
    sourceUrl: asset.sourceUrl,
  });
  if (!isRenderableReviewMediaSrc(src)) return undefined;
  return src === asset.src ? asset : { ...asset, src };
}
