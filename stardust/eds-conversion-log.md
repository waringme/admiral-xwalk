<!-- stardust provenance: writtenBy=stardust:deploy · 2026-10-02 · input stardust/prototypes/{index,about-us,travel-insurance-ski-festivals}-proposed.html (replica archetypes, gate-passed) · target: aem-boilerplate-xwalk (Universal Editor, AEM author content source) -->
# EDS conversion log — admiral-xwalk

## Target runtime (runtime-contract.json)
- xwalk boilerplate: `scripts/aem.js` (never modified) plus a stock `scripts.js`.
- `decorateButtons()` buttonizes only formatted links (`<strong>`/`<em>`) and emits `a.button.primary|secondary|accent` inside `p.button-wrapper`.
- Content source: AEM author (fstab markup mountpoint). Pages are staged as `content/*.plain.html` with
  `<!-- field:x -->` hints and uploaded by the platform UI. This run does not write to DA or AEM.
- Layout breakpoint: **768px**, the source's single breakpoint (the boilerplate's 900px is replaced in
  chrome and blocks).

## Block inventory (locked)
| Block | Kind | Collection pattern (D11) | Decode tier | Used on |
|---|---|---|---|---|
| `hero` | simple (image, mobileImage, text; classes `left`) | hero | template-slotted | home, about-us |
| `breadcrumbs` | simple (text = authored `<ul>` trail) | — | template-slotted | about-us, ski hub |
| `product-tiles` + `product-tile` | container (icon, link) | cards-like | reconstructive | home |
| `teaser` | simple (image, mobileImage, text; classes `light`, `image-after`, `app`) | — (image + copy band) | template-slotted | home ×2, ski hub |
| `cards` + `card` | container (image, text; classes `mobile-image`) | cards | reconstructive | home, about-us, ski hub |
| `banner` | simple (image, mobileImage, text) | — (award band) | template-slotted | home |
| `testimonials` + `testimonial` | container (text) | carousel | reconstructive (runtime loop clones, EW4) | home |

## Default-content sections (D1) and their section `style` values
- `narrow`: "Get to know us" (768px container, 20/60px desktop, 15/40px mobile).
- `centered-intro`: About Us intro copy (768px, centred, 50/20px desktop, 30/15px mobile).
- `intro`: ski hub h1 and intro copy (1024px container, 50px desktop, 30px mobile, flow-root).
- The "Make a claim" CTA is default content in the product-tiles section, styled through
  `.product-tiles-container`.

## Decisions
- Chrome comes from authored `/nav` and `/footer` fragments, and the header block is template-slotted:
  - Nav sections, in order: utility links · brand · main nav (nested lists = dropdown columns + CTA panel) ·
    mobile-only extras · homepage quick actions.
  - The dropdown title repeats the parent label. This is chrome runtime text, allowlisted (#100: chrome is not scored).
- The footer document has three sections: explore columns · social · legal links + registration copy. The live single
  paragraph with `<br><br>` separators is authored as four paragraphs with a 21.6px gap (no layout `<br>`, D-rule).
- Fonts: Admiral's licensed Adobe Fonts kit `mcu8nnf` is loaded by `@import` from `styles/fonts.css`
  (deferred by `loadFonts()`). It is NOT self-hosted: Adobe Fonts terms forbid rehosting, which overrides the
  deploy skill's #80 self-host default and follows the replica fonts policy. A metric-matched
  `jaf-facitweb-fallback` (Arial) sits in `styles.css`.
  - ⚠️ LICENSING / DOMAIN: the EDS preview and live domains must be added to the kit before go-live.
- The homepage has no `<h1>` (R-01, deferred). The pipeline mandates one `<h1>`, so the replica keeps
  the live h2 hero headline and records the gate deviation here. Applying R-01 changes the tag only, not the visuals.
- App-store badges: image-links are not authorable in xwalk richtext, so the teaser `app` variant
  renders authored text links ("App Store", "Google Play") as the brand badge images, with the label text visually hidden.
  This is register entry R-05 (applied): it adds an accessible name and no visual delta.
- Homepage JSON-LD (WebSite/Organization/InsuranceAgency) is not authorable content (D15). Flagged
  for the head/metadata pipeline; not shipped in this run.
- Breadcrumbs live in a block inside `<main>` (live renders them outside the content root).

## Anti-patterns avoided
- No value-slotting: every authored node is moved (EW1).
- No button manufacture.
- No head.html font lines.
- No `<hr>`.
- No nested block tables.

## Gate results (2026-10-02T18:39:53Z, harness regime — EDS runtime render vs live www.admiral.com)
Harness: `aem up --html-folder stardust/.work/preview` (port 3001), pages built with build-harness.mjs.

| page | 1440 pixel / Δh / header / footer | 360 pixel / Δh / header / footer |
|---|---|---|
| homepage | 1.06% / 0 / 100% / 99.73% | 0.86% / 0 / 100% / 99.01% |
| about-us | 0.32% / 0 / 100% / 99.47% | 1.05% / 0 / 99.97% / 99.13% |
| ski hub | 0.47% / 0 / 99.99% / 99.61% | 1.14% / 0 / 99.94% / 99.02% |

- block-roundtrip (+ EW gate) passes on all three pages:
  - 0 structural 🔴 and 0 dead texts.
  - Exemptions: 12 declared (tile icon keys).
  - The two ski "cards" reds are a scoping artifact: the prototype `.finder-grid` holds the finder banner too, and the teaser block's own round-trip closes.
- qa-gate passes on about-us and the ski hub.
  - On the homepage, the only fail is "exactly one h1": R-01 (deferred), mirroring live.
- Lint is clean: eslint (incl. xwalk models) and stylelint.
- davids-model-lint: every 🔴 is D4 (local image srcs). These are deliberate here; the platform uploader rewrites them.
  The 🟡 D1 advisories are justified: hero, teaser, banner, breadcrumbs and testimonials are fixed-composition
  bespoke bands with media and variants, not plain prose.
- Behaviour checks on the EDS render all pass, with 0 console errors, 0 failed requests and no overflow at 1440/768/390:
  - dropdown + blackout open/close
  - mobile menu
  - carousel (3 real + 4 clone slides)
  - tile hover lift
- Fixes found by the gates:
  - teaser photo now absolutely positioned (it was stretching the banner, +24px)
  - app-badge row inline model (−12px)
  - chrome resets dropped to zero specificity with `:where()` (#114: they were cancelling margin-left:auto and the quick-bar padding)
  - blackout made a sibling of the nav (it was intercepting clicks on the open nav)
  - current breadcrumb authored as a link (role parity)
- Not verified here (needs the published origin):
  - CLS
  - content-diff summary
  - AI-readability score
  - published-origin gate
  - eds-schema was emitted after block authoring, not before (recorded honestly).

## DAM image package
- `stardust/packages/admiral-xwalk-images-1.0.0.zip`, FileVault content package (group `admiral-xwalk`):
  - 24 `dam:Asset` nodes under `/content/dam/admiral-xwalk/images`
  - each node carries its original rendition plus dc:format, dam:size, dam:sha1 and tiff dimensions
  - filter: that folder only
- Map from local path to DAM path: `stardust/packages/dam-image-map.json`.
- The staged pages (index, about-us, ski hub, nav) reference the DAM paths. They were applied after the handoff,
  because the handoff script repoints image srcs to local files.
- Install order: package → reprocess assets → upload content → publish assets with the pages.

## Page templates
- Each staged page's metadata carries the site-catalog template it instantiates:
  - homepage → `product-landing`
  - About Us → `hub-landing`
  - Ski Festival Hub → `finder-intro`
- These render as the body classes `product-landing` / `hub-landing` / `finder-intro`.
- The page model (`models/_page.json`) gained two Universal Editor fields:
  - **Template** (select)
  - **Header variant** (`theme`, select)
- The mobile quick-action bar is a per-page choice, NOT a template trait: live `/admiralrewards` shows it and
  `/car-insurance/electric/tesla-insurance` (same template) doesn't. So it moved from `template: front-page` to
  `theme: quick-actions` (homepage). The header block and the `--nav-height` reservation key on `body.quick-actions`.
- Re-gated the homepage (local images mapped): 1.06% / 0.86%, height Δ0 — unchanged.
