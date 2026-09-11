/**
 * Product-hero `src` paths that are brand logos / wordmarks / logo CDN stubs —
 * not product photography. Populated by media audit logo detection and manual QA.
 *
 * `isAuthenticProductMedia` rejects these so hub cards never promote them.
 */
export const LOGO_HERO_SRC_DENYLIST: ReadonlySet<string> = new Set([
  // Mirafit CDN returns this brand logo when a product path is missing (~50KB stub).
  // Prefix match is handled in fetch scripts; keep empty until audit pins a path.
]);
