<!-- stardust provenance: skill=stardust:replica (Phase 2 step 4) · 2026-10-02 · from stardust/dynamic-features.md -->
# Dynamic features plan — www.admiral.com

| phase | rows | deliverable | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|---|
| widgets (done in prototypes) | 1–3 | mega-nav, mobile menu, testimonials carousel, hovers in `js/motion.js` + `css/motion.css` | nav = header fragment links; carousel = authored rows, clones generated at runtime | behavior-match probe (validate.mjs) + published-origin replay at 1440/360 | — | carried into blocks at deploy |
| tags | 5–8 | consent-gated loader in `delayed.js` once ids are supplied | none (config only) | dynamics-check on the published origin | decision batch: tags, CMP, chat | small once ids exist |
| register | 9, 12 | inspect row 9 at rollout B2; row 12 stays decided-out | — | — | row 9 vendor identity | trivial |
| assets | 10 | authored media replacing the blob CDN references | images authored per block | media-reconcile at migrate | — | part of migrate |
| locale | 11 | none if single-locale is confirmed | — | — | confirm en-GB only | none |
