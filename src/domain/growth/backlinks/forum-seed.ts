import type { BacklinkOpportunity } from "./types";
import { kitleticsPublicUrl } from "./public-url";

const NOW = "2026-09-13T08:00:00.000Z";
const DB = kitleticsPublicUrl("/running/shoes/database");
const FINDER = kitleticsPublicUrl("/tools/running-shoe-finder");

/**
 * Fresh-enough public threads found 13 Sep 2026. Reddit JSON was blocked, so
 * created_utc is UNKNOWN — therefore none are tagged RESPOND_TODAY.
 * Exact replies are stored so a human can post after checking age + rules.
 */
export function seedForumOpportunities(): BacklinkOpportunity[] {
  const rsgReply = `I'd treat the Novablast 6 as a daily trainer with a bit more forefoot response than the 5, not as a max-stack "super trainer".

For a heavier runner the usual question is whether the foam still feels planted after the first easy miles, not whether it feels exciting on day one. If the 5 felt too soft, the 6's firmer forefoot puck can help, but it still isn't a stability shoe — if you want structure, that's a different last.

I'd still try it next to something with a broader platform if 86 kg on a tall stack made the 5 feel tippy.

This is spec and typical-use guidance, not a wear-test of your pair.`;

  const hardlopenReply = `De Vomero 18 is een logische daily/long-run keuze als je demping wilt zonder carbonschoen.

Of hij "goed" is hangt vooral af van pasvorm en of je de hoge stack prettig vindt, niet van een generieke ranking. De Plus is in reviews vaak nóg zachter/hoger; als de 18 in de winkel al goed voelt, is dat meestal het betere signaal dan een internet-oordeel.

Ik zou hem naast je huidige Pegasus/daily zetten: zelfde maat, andere demping. Fit beslist het, niet de marketingnaam.

Dit is geen Kitletics-draagtest van jouw paar.`;

  return [
    {
      id: "opp-forum-rsg-novablast-6",
      prospectId: "prospect-reddit-com",
      siteName: "r/RunningShoeGeeks",
      domain: "reddit.com",
      url: "https://www.reddit.com/r/RunningShoeGeeks/comments/1uh3twk/asics_novablast_6/",
      opportunityType: "REDDIT_THREAD",
      contactRole: "unknown",
      contactMethod: "REDDIT_THREAD",
      contactUrl: "https://www.reddit.com/r/RunningShoeGeeks/comments/1uh3twk/asics_novablast_6/",
      country: "US",
      language: "en",
      market: "global",
      topic: "Asics Novablast 6 — heavier-runner question",
      sport: "running",
      authorityScore: 58,
      relevanceScore: 88,
      likelihoodScore: 40,
      assetFitScore: 80,
      relationshipScore: 20,
      editorialQualityScore: 78,
      overallScore: 72,
      scoreReasons: ["Live model question", "RULES_UNKNOWN so NO_LINK"],
      targetAssetId: "asset-shoe-database",
      targetUrl: "/running/shoes/database",
      publicAssetUrl: DB,
      recommendedAnchorContext: "optional spec lookup after rules check",
      pitchAngle: "Answer the heavier-runner question first.",
      whyTheyMightLink: "Thread asks whether NB6 works for taller/heavier runners.",
      whyThisSite: "r/RunningShoeGeeks is where current-model daily-trainer questions land.",
      whyThisAsset: "Database can compare stack/weight after a human confirms rules.",
      whyThisAngle: "Help first; no Kitletics URL until rules are KNOWN.",
      evidence:
        "Public thread: OP ran 10 miles in NB6; comment asks if it works at 6'5 / 86 kg. Age UNKNOWN (Reddit JSON blocked 2026-09-13).",
      risk: "REVIEW",
      riskReasons: ["Self-promo risk on Reddit", "Rules not confirmed"],
      sourceType: "forum_thread",
      discoveredAt: NOW,
      status: "CANDIDATE",
      priority: "HIGH",
      outreachStatus: "draft_ready",
      responseStatus: "none",
      campaignId: "campaign-forum-answers",
      metricSource: "editorial_judgment",
      helpfulnessScore: 82,
      spamRiskScore: 35,
      communityFitScore: 78,
      linkRecommendation: "NO_LINK",
      linkRecommendationReason: "RULES_UNKNOWN — do not include a Kitletics URL.",
      communityId: "comm-reddit-runningshoegeeks",
      communityRulesStatus: "RULES_UNKNOWN",
      suggestedResponse: rsgReply,
      nextAction:
        "Reply here: https://www.reddit.com/r/RunningShoeGeeks/comments/1uh3twk/asics_novablast_6/",
      forumThread: {
        communityId: "comm-reddit-runningshoegeeks",
        community: "r/RunningShoeGeeks",
        url: "https://www.reddit.com/r/RunningShoeGeeks/comments/1uh3twk/asics_novablast_6/",
        thread: "Asics Novablast 6",
        subreddit: "r/RunningShoeGeeks",
        threadDate: "UNKNOWN",
        questionIntent: "heavier_runner",
        existingAnswers: "OP impressions of NB6 vs NB5; question about taller/heavier use.",
        selfPromoRisk: 35,
        linkPolicy: "UNKNOWN",
        suggestedResponse: rsgReply,
        recommendedAssetId: "asset-shoe-database",
        forumUrgency: "MONITOR",
      },
    },
    {
      id: "opp-forum-hardlopen-vomero-18",
      prospectId: "prospect-reddit-com",
      siteName: "r/Hardlopen",
      domain: "reddit.com",
      url: "https://www.reddit.com/r/Hardlopen/comments/1tgkdg7/is_de_nike_vomero_18_een_goede_schoen/",
      opportunityType: "REDDIT_THREAD",
      contactRole: "unknown",
      contactMethod: "REDDIT_THREAD",
      contactUrl: "https://www.reddit.com/r/Hardlopen/comments/1tgkdg7/is_de_nike_vomero_18_een_goede_schoen/",
      country: "NL",
      language: "nl",
      market: "NL",
      topic: "Is de Nike Vomero 18 een goede schoen?",
      sport: "running",
      authorityScore: 50,
      relevanceScore: 86,
      likelihoodScore: 38,
      assetFitScore: 78,
      relationshipScore: 22,
      editorialQualityScore: 76,
      overallScore: 70,
      scoreReasons: ["Dutch community", "RULES_UNKNOWN so NO_LINK"],
      targetAssetId: "asset-shoe-finder",
      targetUrl: "/tools/running-shoe-finder",
      publicAssetUrl: FINDER,
      recommendedAnchorContext: "optional after rules",
      pitchAngle: "Beantwoord de Vomero-18-vraag in het Nederlands.",
      whyTheyMightLink: "Vraag of de Vomero 18 een goede daily is.",
      whyThisSite: "r/Hardlopen is the main Dutch running subreddit.",
      whyThisAsset: "Finder only after rules are confirmed; reply stands without a link.",
      whyThisAngle: "Dutch, helpful, no disguised promo.",
      evidence:
        "Public r/Hardlopen thread asking if Vomero 18 is a good shoe. Age UNKNOWN (Reddit JSON blocked).",
      risk: "REVIEW",
      riskReasons: ["Self-promo risk", "Rules not confirmed"],
      sourceType: "forum_thread",
      discoveredAt: NOW,
      status: "CANDIDATE",
      priority: "HIGH",
      outreachStatus: "draft_ready",
      responseStatus: "none",
      campaignId: "campaign-forum-answers",
      metricSource: "editorial_judgment",
      helpfulnessScore: 80,
      spamRiskScore: 32,
      communityFitScore: 80,
      linkRecommendation: "NO_LINK",
      linkRecommendationReason: "RULES_UNKNOWN — Dutch reply without a Kitletics URL.",
      communityId: "comm-reddit-hardlopen",
      communityRulesStatus: "RULES_UNKNOWN",
      suggestedResponse: hardlopenReply,
      nextAction:
        "Reply here: https://www.reddit.com/r/Hardlopen/comments/1tgkdg7/is_de_nike_vomero_18_een_goede_schoen/",
      forumThread: {
        communityId: "comm-reddit-hardlopen",
        community: "r/Hardlopen",
        url: "https://www.reddit.com/r/Hardlopen/comments/1tgkdg7/is_de_nike_vomero_18_een_goede_schoen/",
        thread: "Is de Nike Vomero 18 een goede schoen?",
        subreddit: "r/Hardlopen",
        threadDate: "UNKNOWN",
        questionIntent: "daily_trainer",
        existingAnswers: "Several owners compare Vomero 18 vs Plus vs Pegasus.",
        selfPromoRisk: 32,
        linkPolicy: "UNKNOWN",
        suggestedResponse: hardlopenReply,
        recommendedAssetId: "asset-shoe-finder",
        forumUrgency: "MONITOR",
      },
    },
  ];
}
