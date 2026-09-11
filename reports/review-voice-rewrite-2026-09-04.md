# Review voice rewrite check — 2026-09-04

Enriched 183 reviews. **183 clean**, **0 junk/report hits**.
Source-field junk (CONTENT-002): **0**. Use `--write` to persist clean voice.

All enriched reviews pass the expert buying-guide voice detector.

Voice contract: `src/lib/review/review-voice.ts`
Writer skill: `.cursor/skills/review-writer/SKILL.md`
Agent: `agents/product-review/voice.md` + `npm run reviews:agent`