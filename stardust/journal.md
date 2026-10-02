# Journal — admiral-xwalk replica

Chronological, append-only record of prompts, decisions and open questions for this stardust project.

## 2026-10-02T16:56:46Z — Bounded same-design replica of three archetypes (product-landing, hub-landing, finder-intro)

**Prompt:** after the site-scope catalog of www.admiral.com (827 URLs, 56 templates), replicate sample
pages for the product-landing, hub-landing and finder-intro templates, keeping the current design.

**Decisions:**
- Flow: `stardust:replica` (keep design, re-platform); no prepare-migration step. Bounded entry with
  `extract --pages / ,/about-us,/travel-insurance/ski-festivals --dynamics`; Phase 2 bounded-single
  synthesis.
- Archetypes taken from the catalog's representative URLs: `/` (product-landing), `/about-us`
  (hub-landing), `/travel-insurance/ski-festivals` (finder-intro).
- Fonts: Admiral's own Adobe Fonts kit `mcu8nnf` is referenced (it serves to localhost). Nothing is
  rehosted. EDS domains must be added to the kit before launch.
- The slick carousel's loop clones are generated at runtime, the same mechanism slick uses, so
  the authored content stays three slides and content-diff reaches 0 red.
- Kept the Drupal quirks the gate depends on: JSON-LD carried verbatim in the content root, the
  footer-in-content-root scope on About Us (handled by a symmetric `> div:first-child` scope),
  clearfix containment on the ski containers (`flow-root`), and `&nbsp;` byte patterns.
- The 4 a11y inconsistencies found (no homepage h1, h1→h3 jumps, missing alts, stray alt
  whitespace) are register entries, deferred. The prototypes mirror live.

**Artifacts:**
- stardust/current/ — created (extract: 3 page JSON + rendered DOM + screenshots, _dynamics.json)
- PRODUCT.md, DESIGN.md, DESIGN.json — created (bounded-single)
- stardust/direction.md, stardust/replica/inconsistency-register.md, stardust/replica/tokens.json — created
- stardust/prototypes/{index,about-us,travel-insurance-ski-festivals}-proposed.html + css/ (canon, icons, motion, per-archetype) + js/motion.js + assets/img (36) — created
- stardust/replica/progress.json, stardust/replica/gates/*, stardust/replica/motion/*.json — created
- stardust/dynamic-features.md, stardust/dynamic-features-plan.md — created
- stardust/state.json — 3 pages → prototyped

**Findings:**
- Gate results (prototype regime), pixel diff at 1440 / 360:
  - Home: 0.22% / 0.85%
  - About Us: 0.32% / 0.95%
  - Ski hub: 0.33% / 1.14%
  - All six: height Δ0, 0 structural red, chrome crops ≥99%, chrome-parity quiet.
- The only live-only pixel content is the TrustArc cookie badge (#teconsent), dynamics row 5.
- The site has one layout breakpoint (768px). The Hero B height is fluid (`30vw`, clamped
  420–510px), which only the 1920 box-map check revealed.
- Homepage gate rounds exceeded the 3-round cap: 5 at 1440 and 4 at 360. The extra rounds were
  markup/parity corrections against a cached live capture; recorded in progress.json.
- The mobile header differs per template: the quick-action bar only appears on the homepage.

**Open questions:**
- Owner decision batch (dynamic-features.md): tags/CMP/chat ids on the EDS host, the unknown
  CloudFront host, single-locale confirmation, Adobe Fonts kit domain allow-list.
- Approval of the three archetypes before handoff to migrate → deploy.

**Next:** user approval of the archetypes, then Phase 5: `stardust:deploy` per archetype into
xwalk blocks, with the published-origin gate.

## 2026-10-02T18:39:53Z — Deployed code to branch `stardust-replica` and staged 3 sample content pages

**Prompt:** carry on, deploy the code and create a few sample content pages.

**Decisions:**
- Built the xwalk blocks (each with a UE model):
  - hero, breadcrumbs, product-tiles, teaser, cards, banner, testimonials
  - header/footer chrome from authored /nav and /footer documents
- Staged content/{index,about-us,travel-insurance/ski-festivals}.plain.html plus nav/footer, with field hints.
- Fonts come from the Adobe Fonts kit via fonts.css `@import` (no rehosting); head.html untouched.
- No DA/AEM writes from the agent: the platform uploads the content from its UI.

**Artifacts:** blocks/**, styles/*, icons/*, models/_section.json, component-*.json, favicon.ico,
content/*.plain.html, stardust/eds-conversion-log.md, stardust/runtime-contract.json, stardust/eds-schema/*.

**Findings:** all six EDS renders pass against live:
- pixel diff 0.32–1.14%
- height Δ0
- chrome crops ≥99%

**Open questions:** upload the content from the UI; preview at the branch URL; add the EDS domains to the Adobe Fonts kit; then run the published-origin gate.

**Next:** platform content upload → published-origin gate (CLS, content-diff, AI readability) → PR to main.
