import type { AudienceFit } from "@/lib/product/audience";

/** Path prefixes that accept `?gender=` on running catalogs. */
export const RUNNING_GENDER_PATH_PREFIXES = [
  "/running/shoes",
  "/running/clothing",
  "/running/packs",
  "/running/recovery",
  "/running/gear",
] as const;

export function withRunningGender(
  href: string,
  gender: AudienceFit | undefined,
): string {
  if (!gender) return href;
  const [path, hash = ""] = href.split("#");
  const [pathname, existing = ""] = path.split("?");
  const params = new URLSearchParams(existing);
  params.set("gender", gender);
  const qs = params.toString();
  return `${pathname}?${qs}${hash ? `#${hash}` : ""}`;
}

export function runningHrefSupportsGender(href: string): boolean {
  const pathname = href.split("?")[0] ?? href;
  if (pathname === "/running") return true;
  return RUNNING_GENDER_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function applyRunningGenderToHref(
  href: string,
  gender: AudienceFit | undefined,
): string {
  if (!gender || !runningHrefSupportsGender(href)) return href;
  return withRunningGender(href, gender);
}
