/**
 * Kitletics review voice contract.
 * Shared by the review writer skill, synthesizer, page enrichment, and audit.
 *
 * Role: experienced gear editor helping a friend decide — not a research paper,
 * not SEO filler, not a lecture on how to read the page.
 */

/** Phrases that mean the section must be rewritten wholesale. */
export const REPORT_OR_JUNK_VOICE =
  /stands out in-catalog|earns consideration when you specifically want|evaluated from verified specs|where independent wear|Documented compromise:|Catalog strengths relevant|Published measurements and design markers|These establish what .+ is — not subjective|Expert Research|least ambiguous|design facts we treat as anchors|lab certificate|structured catalog|Subjective feel|research estimate|wear-logged|How to read this section|Kitletics has not personally|editorial research|verified product specifications|Performance assessment|we treat as anchors|not a lab certificate|research-based guidance|structured sources|Keep the product.?s strengths in view|Also keep the trade-offs in view|When you finish this section|Here.?s what matters in this section|Still deciding on the |Optional stress test:|Think of it as a friend who|not a checklist to memorise|walk this checklist|Re-check the strengths you would actually use|Contextual factor score|Matched recommendation context|assessed from verified specifications and Kitletics structured|primary job \(|Outside that brief|inferred from geometry|Kitletics frames performance|Standout catalog points|Value for .+ depends on whether you will use its documented strengths|A useful price test:|A useful mental model:|Bottom of this section:|Fit decides whether|Practical tip:|Unless this page says|Unless we disclose personal testing|Neutral is not .?unstable|guidance is not automatically better|buy the platform that matches how you run, not the marketing label|Uppers do quiet work:|Width \([^)]+\) can matter as much as the stability label|Published widths|best estimate from materials|not a logged wear diary|High-wear zones on road shoes are usually|Rotate when you can, and retire the shoe when protection or grip fades — not when you get bored of the colourway/i;

export const REVIEW_VOICE_PRINCIPLES = [
  "Write as an expert gear editor giving honest buying advice.",
  "Lead with what the product is for, who should buy it, and who should skip it.",
  "Be specific: names, sessions, surfaces, trade-offs — not generic praise.",
  "Second person is fine (“I'd shortlist it when…”). Never lecture how to read the review.",
  "Never invent first-hand testing. If we did not use it, say so once in disclosure — not in every section.",
  "No research-paper voice, no catalog jargon, no word-count padding.",
  "One job per section. Short flowing paragraphs beat stacked templates.",
  "Keep real editorial notes (fit/ride/value) as the lead; only add missing facts.",
] as const;

export function isReportOrJunkVoice(text: string): boolean {
  return REPORT_OR_JUNK_VOICE.test(text.trim());
}

/** Soften mid-sentence list items from Title Case catalog strings. */
export function softList(items: string[], n = 3): string {
  return items
    .slice(0, n)
    .map((s) => s.charAt(0).toLowerCase() + s.slice(1))
    .join(", ")
    .replace(/, ([^,]*)$/, " or $1");
}

export const FRIENDLY_TESTING_CONTEXT = (productName: string) =>
  `Expert Research Review — how we assessed this product: we compared published specs for the ${productName} with similar products in the same job. We have not personally tested this product unless the page says we did. Scores and notes are meant to help you decide — affiliate links do not change the verdict.`;

/**
 * Fix 85: FRIENDLY_TESTING_CONTEXT intentionally contains phrases that match
 * REPORT_OR_JUNK_VOICE. That is correct for **decision copy** bans, but
 * disclosure must be scored separately — see reviewDecisionCopyText().
 */
export const FRIENDLY_EDITORIAL_DISCLOSURE =
  "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict.";
