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

## 2026-10-02T19:05:09Z — DAM image package for the sample pages

**Prompt:** the images are not in AEM; create an image JCR package.

**Decisions:**
- Built a FileVault package with 24 dam:Asset nodes under /content/dam/admiral-xwalk/images.
- The user chose to repoint the staged pages to the DAM paths.

**Artifacts:** stardust/packages/admiral-xwalk-images-1.0.0.zip, stardust/packages/dam-image-map.json, content/*.plain.html (img srcs).

**Next:** install the package on author, reprocess the assets, then upload the content.

## 2026-10-02T19:47:37Z — Template metadata on the sample pages

**Prompt:** add the templates used to the content.

**Decisions:**
- Template metadata set from the site catalog: product-landing / hub-landing / finder-intro.
- The homepage quick-action bar moved to `Theme: quick-actions`, because live shows the bar per page, not per template.
- Added Template and Header variant fields to the UE page model.

**Artifacts:** models/_page.json, component-models.json, blocks/header/header.js, styles/styles.css, content/*.plain.html.

**Findings:** homepage re-gate unchanged (1.06% / 0.86%, height Δ0).

## 2026-10-04 — About Us child pages and dynamic cards

**Prompt:** create the About Us cards as pages under /about-us with the live images and content, then make the card block dynamic from a folder.

**Decisions:**
- Six pages under `/about-us/`, with copy taken verbatim from live and the card summaries taken from the live hub pods.
- Cards gained a folder field plus a query-index listing; the authored rows remain as the fallback.
- New timeline block, with an author-facing Icon/Feature display option, because live shows some graphics on mobile and hides others.
- Live-side one-off sizing (R-06) and empty markup (R-07) were logged, not replicated.

**Artifacts:**
- `blocks/cards/*`, `blocks/timeline/*`, `blocks/breadcrumbs/breadcrumbs.css`, `styles/styles.css`
- `models/_page.json`, `models/_section.json`, `helix-query.yaml`
- `content/about-us/*.plain.html`, `content/about-us.plain.html`
- `stardust/packages/admiral-xwalk-images-1.1.0.zip`

**Findings:**
- 13 of 14 child-page gates pass. The Stay at Home Refund page at 360 fails at 13.5%, because of R-07.
- The homepage, About Us and Ski Festival Hub gates are unchanged.

## 2026-10-09 — Travel demo (landing pages + articles)

**Prompt:** import the travel insurance SEO and PPC pages, the travel-planning hub and the example article, and build the Landing page and Article templates for the demo.

**Decisions (asked):**
- the hub's 6 articles plus the example
- one shared fragment each, using the SEO wording
- demo-grade close match

**Artifacts:**
- `blocks/{features,media-text,comparison-table,callout,accordion,highlights}`, `templates/article`, `scripts/scripts.js`, `styles/styles.css`
- `models/_page.json`, `models/_section.json`
- 15 pages: 2 landing, 1 hub, 7 articles, 4 fragments, nav-ppc
- `stardust/packages/admiral-xwalk-images-1.3.0.zip`

**Findings:**
- Live already shares two of the three sections on the SEO page (Drupal reusable blocks) but not on PPC, which is the demo's point.
- One hub card points at a removed URL.
- All 12 pages are clean at 1440 and 360.
