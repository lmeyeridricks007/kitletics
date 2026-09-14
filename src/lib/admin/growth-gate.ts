export function isAdminGrowthPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function adminGrowthSecretConfigured(): boolean {
  return Boolean(process.env.ADMIN_GROWTH_SECRET?.trim());
}

/** Production without a secret must not expose /admin. */
export function should404Admin(): boolean {
  return process.env.NODE_ENV === "production" && !adminGrowthSecretConfigured();
}

export function basicAuthOk(header: string | null): boolean {
  const secret = process.env.ADMIN_GROWTH_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    const user = sep === -1 ? "" : decoded.slice(0, sep);
    const pass = sep === -1 ? decoded : decoded.slice(sep + 1);
    const expectedUser = process.env.ADMIN_GROWTH_USER?.trim() || "kitletics";
    return user === expectedUser && pass === secret;
  } catch {
    return false;
  }
}
