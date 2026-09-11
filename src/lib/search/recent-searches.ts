const STORAGE_KEY = "kitletics.recentSearches";
const MAX = 8;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return;
  const existing = readRecentSearches().filter(
    (x) => x.toLowerCase() !== q.toLowerCase(),
  );
  const next = [q, ...existing].slice(0, MAX);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
