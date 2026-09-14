import { siteConfig } from "@/content/config";

export function kitleticsPublicUrl(path: string | undefined): string {
  if (!path || path === "/") return "";
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${p}`;
}

export function firstName(name: string | undefined): string | undefined {
  const token = name?.trim().split(/\s+/)[0];
  if (!token || token === "UNKNOWN" || token === "unnamed") return undefined;
  return token;
}

const VAGUE =
  /confirm masthead|check (their )?contact page|find (their )?editor|go to their website|search contact/i;

export function isVagueContactInstruction(text: string | undefined): boolean {
  return Boolean(text && VAGUE.test(text));
}
