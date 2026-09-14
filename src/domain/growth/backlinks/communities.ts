import type { CommunityPolicy } from "./types";

function unknownCommunity(
  partial: Omit<CommunityPolicy, "selfPromotionPolicy" | "linkPolicy" | "accountAgeRequirements" | "karmaRequirements" | "commercialDisclosureRules" | "rulesStatus"> &
    Partial<CommunityPolicy>,
): CommunityPolicy {
  return {
    selfPromotionPolicy: "UNKNOWN",
    linkPolicy: "UNKNOWN",
    accountAgeRequirements: "UNKNOWN",
    karmaRequirements: "UNKNOWN",
    commercialDisclosureRules: "UNKNOWN",
    rulesStatus: "RULES_UNKNOWN",
    ...partial,
  };
}

/**
 * Locator rows only. Policy fields stay UNKNOWN until a human opens rulesUrl.
 * Do not treat these URLs as permission to post.
 */
export function seedCommunities(): CommunityPolicy[] {
  return [
    unknownCommunity({
      id: "comm-reddit-running",
      community: "r/running",
      url: "https://www.reddit.com/r/running/",
      rulesUrl: "https://www.reddit.com/r/running/about/rules/",
      platform: "reddit",
      notes:
        "Running general. Open the subreddit rules this week before any Kitletics URL. Many running subs treat brand accounts as spam.",
    }),
    unknownCommunity({
      id: "comm-reddit-runningshoegeeks",
      community: "r/RunningShoeGeeks",
      url: "https://www.reddit.com/r/RunningShoeGeeks/",
      rulesUrl: "https://www.reddit.com/r/RunningShoeGeeks/about/rules/",
      platform: "reddit",
      notes: "Shoe-specific. Confirm self-promo and affiliate rules before linking a database or finder.",
    }),
    unknownCommunity({
      id: "comm-reddit-advancedrunning",
      community: "r/AdvancedRunning",
      url: "https://www.reddit.com/r/AdvancedRunning/",
      rulesUrl: "https://www.reddit.com/r/AdvancedRunning/about/rules/",
      platform: "reddit",
      notes: "Often low tolerance for promotional accounts. Default to NO_LINK until rules are confirmed.",
    }),
    unknownCommunity({
      id: "comm-reddit-marathon",
      community: "r/Marathon_Training",
      url: "https://www.reddit.com/r/Marathon_Training/",
      rulesUrl: "https://www.reddit.com/r/Marathon_Training/about/rules/",
      platform: "reddit",
      notes: "Training questions. Answer the training/shoe job first; link only if a page adds comparison detail.",
    }),
    unknownCommunity({
      id: "comm-reddit-triathlon",
      community: "r/triathlon",
      url: "https://www.reddit.com/r/triathlon/",
      rulesUrl: "https://www.reddit.com/r/triathlon/about/rules/",
      platform: "reddit",
      notes: "Multisport. Kitletics shoe/watch pages may fit; do not assume brick/swim coverage.",
    }),
    unknownCommunity({
      id: "comm-reddit-trailrunning",
      community: "r/trailrunning",
      url: "https://www.reddit.com/r/trailrunning/",
      rulesUrl: "https://www.reddit.com/r/trailrunning/about/rules/",
      platform: "reddit",
      notes: "Trail-specific. Prefer trail-relevant assets; skip road-only roundups.",
    }),
    unknownCommunity({
      id: "comm-reddit-hyrox",
      community: "r/hyrox",
      url: "https://www.reddit.com/r/hyrox/",
      rulesUrl: "https://www.reddit.com/r/hyrox/about/rules/",
      platform: "reddit",
      notes: "Confirm the subreddit still exists and its rules before posting. Hybrid-shoe questions may fit the finder.",
    }),
    unknownCommunity({
      id: "comm-reddit-hardlopen",
      community: "r/Hardlopen",
      url: "https://www.reddit.com/r/Hardlopen/",
      rulesUrl: "https://www.reddit.com/r/Hardlopen/about/rules/",
      platform: "reddit",
      notes:
        "Dutch running subreddit. Open rules before any Kitletics URL. Draft in Dutch. Default NO_LINK while rules are unknown.",
    }),
    unknownCommunity({
      id: "comm-reddit-fitness",
      community: "r/Fitness",
      url: "https://www.reddit.com/r/Fitness/",
      rulesUrl: "https://www.reddit.com/r/Fitness/about/rules/",
      platform: "reddit",
      notes: "Broad fitness. Self-promo risk is usually high. Prefer NO_LINK.",
    }),
    unknownCommunity({
      id: "comm-letsrun",
      community: "LetsRun forums",
      url: "https://www.letsrun.com/forum/",
      platform: "forum",
      notes: "Confirm current forum posting and commercial-link rules before any URL. No auto-post.",
    }),
    unknownCommunity({
      id: "comm-slowtwitch",
      community: "Slowtwitch forums",
      url: "https://forum.slowtwitch.com/",
      platform: "forum",
      notes: "Triathlon forum. Confirm vendor/self-promo rules. No scraping of gated threads.",
    }),
    unknownCommunity({
      id: "comm-facebook-running",
      community: "Facebook running groups (human member only)",
      url: "https://www.facebook.com/",
      platform: "facebook",
      notes:
        "Do not scrape. Engage only if a human is already a permitted member and the group allows the kind of reply. Never create sock accounts.",
    }),
  ];
}

export function mergeCommunityRegistry(
  stored: CommunityPolicy[] | undefined,
): CommunityPolicy[] {
  const seed = seedCommunities();
  const byId = new Map(seed.map((c) => [c.id, c]));
  for (const row of stored ?? []) {
    if (!row?.id) continue;
    const prev = byId.get(row.id);
    byId.set(row.id, prev ? { ...prev, ...row, id: row.id } : row);
  }
  return [...byId.values()];
}

export function findCommunity(
  communities: CommunityPolicy[],
  input: { communityId?: string; subreddit?: string; url?: string; community?: string },
): CommunityPolicy | undefined {
  if (input.communityId) {
    const hit = communities.find((c) => c.id === input.communityId);
    if (hit) return hit;
  }
  const sub = (input.subreddit ?? "").replace(/^r\//i, "").toLowerCase();
  if (sub) {
    const hit = communities.find((c) =>
      c.community.toLowerCase().replace(/^r\//, "") === sub,
    );
    if (hit) return hit;
  }
  const url = (input.url ?? "").toLowerCase();
  if (url) {
    const hit = communities.find((c) => url.startsWith(c.url.toLowerCase()));
    if (hit) return hit;
    const reddit = url.match(/reddit\.com\/r\/([^/?#]+)/i);
    if (reddit?.[1]) {
      const name = reddit[1].toLowerCase();
      const bySub = communities.find(
        (c) => c.community.toLowerCase().replace(/^r\//, "") === name,
      );
      if (bySub) return bySub;
    }
  }
  const name = (input.community ?? "").toLowerCase();
  if (name) {
    return communities.find((c) => c.community.toLowerCase() === name);
  }
  return undefined;
}

export function unknownCommunityStub(input: {
  community?: string;
  subreddit?: string;
  url?: string;
}): CommunityPolicy {
  const sub = input.subreddit?.replace(/^r\//i, "");
  const label = sub ? `r/${sub}` : input.community || "Unknown community";
  const url = input.url || (sub ? `https://www.reddit.com/r/${sub}/` : "UNKNOWN");
  return unknownCommunity({
    id: `comm-unknown-${(sub || label).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
    community: label,
    url,
    rulesUrl: sub ? `https://www.reddit.com/r/${sub}/about/rules/` : undefined,
    platform: sub || /reddit/i.test(url) ? "reddit" : "other",
    notes: "Not in the verified registry. RULES_UNKNOWN — human must review before any link.",
  });
}
