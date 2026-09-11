"use server";

import { searchKitletics } from "@/lib/search/engine";
import { groupSearchHits } from "@/lib/search/group-hits";
import type { SearchHit } from "@/lib/search/types";

export interface SearchActionResult {
  hits: SearchHit[];
  grouped: ReturnType<typeof groupSearchHits>;
}

/**
 * Header search dialog — keep catalog indexing on the server.
 * Client receives only slim SearchHit payloads.
 */
export async function searchKitleticsAction(
  query: string,
  limit = 24,
): Promise<SearchActionResult> {
  const q = query.trim();
  if (!q) return { hits: [], grouped: [] };
  const hits = searchKitletics(q, { limit });
  return { hits, grouped: groupSearchHits(hits) };
}
