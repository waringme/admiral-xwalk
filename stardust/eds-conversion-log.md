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

## About Us child pages + dynamic cards (2026-10-04)

**Pages** — six pages under `/about-us/`, all with verbatim live copy and live images (43 new images under the DAM `about-us/` folder):

| Page | Template | Content |
|---|---|---|
| `our-milestones` | timeline | breaker, title, timeline block (20 milestones) |
| `the-admiral-brand` | timeline | breaker, article |
| `stay-at-home-refund` | timeline | breaker, article with list |
| `working-for-admiral` | timeline | breaker, article, logos, awards list |
| `community-and-sponsorship` | article | hero image, article, two intros, 11 community and 4 sponsorship pods (with tags) |
| `awards` | stacked-banners | title banner, banner block, alternating award sections |

- The live community page sits at `/community-and-sponsorship`; it is placed under `/about-us/` as asked.

**Each page's metadata** feeds its card:
- Title, Description, Image, Template
- Card Title, Card Summary, Card Link Text, Card Order (1–6). The card copy is the live About Us pod copy, so the hub is unchanged.

**Dynamic cards** (`blocks/cards`):
- **Folder field.** The cards block gained a `folder` field (aem-content). When it is set, the block reads `/query-index.json` and renders one card per page in that folder, sorted by Card Order.
  - Each card uses the page's Card Title, Card Summary, Card Link Text and Image. It falls back to the page title and description.
  - The current page is excluded (by its canonical path).
- **Fallback.** The authored rows stay as the fallback (document-first), so About Us shows its six cards even before the index exists.
- **`helix-query.yaml`** indexes:
  - title, description, image path, template
  - cardTitle, cardSummary, cardLinkText, cardOrder
- **Siblings strip.** Every child page except Awards and Community ends with the same dynamic strip: folder `/about-us`, variant `mobile-image lead-two`. That gives live's 2-then-3 layout.
- **New variants:**
  - `two-up`, `lead-two` and `narrow`
  - `mobile-image` (keeps the image strip on mobile)
- **Tag strip.** A first `<p><strong>` in the card text becomes the coloured tag strip on the image (Community / Sponsorship).

**Timeline block** (`blocks/timeline`, new):
- Built from milestone items: image, alt, display, and text (h3 date, h2 title, p).
- **Desktop:**
  - Entries alternate around a 10px centre line, with an opening year badge derived from the first date.
  - Landscape photos sit under the title; square icons sit above the date, on the text baseline.
- **Mobile:**
  - Entries are centred and joined by live's 22×68 divider (4px line, 22px dot), drawn in CSS.
  - Photos lead the entry, and pictograms are hidden.
- **`display` option** (Icon / Feature): Feature graphics (25-year badge, Alfie, 30-year graphic) show on every screen, as on live.

**Section styles added:** breaker, article, centered-title, title-banner, award, award-alt, logos, hero-image.
- Spacing that depends on the neighbouring section (lifted from live):
  - hero image → article opens 50/30px
  - article → intro has no gap
  - pods → heading uses `.pt-sml` (20/15px)
  - timeline → pods uses `.pt-lrg` (120px)
  - narrow pods sit directly under their intro
- Breadcrumbs stay on one line (live `nowrap`).

**Gates** — EDS harness vs live:
- Local images were mapped in, and the dynamic cards ran against a mock `query-index.json` built from the page metadata; the mock was deleted afterwards.

| Page | 1440 | 360 |
|---|---|---|
| About Us | 0.32% Δ0 | 1.05% Δ0 (unchanged by the dynamic cards) |
| Our milestones | 4.49% Δ−63 (R-06) | 6.78% Δ−4 |
| The Admiral brand | 0.32% Δ0 | 5.82% Δ−1 |
| Stay at Home Refund | 4.68% Δ−8 (R-07) | 13.53% Δ−13 (R-07 — FAIL) |
| Community & sponsorship | 0.47% Δ0 | 1.56% Δ0 |
| Working for Admiral | 0.54% Δ0 | 8.53% Δ4 |
| Awards | 4.06% Δ28 (R-06) | 8.62% Δ29 |
| Homepage (regression) | 1.06% Δ0 | 0.86% Δ0 |
| Ski Festival Hub (regression) | 0.47% Δ0 | 1.14% Δ0 |

- The Stay at Home Refund page at 360 fails the 10% threshold, because live's empty trailing list (R-07) shifts the cards 13px. Everything above it matches to ≤2px.
- Fixes found by the gates:
  - siblings strip `two-up` → `lead-two` (−400px at desktop)
  - stacked logos on mobile
  - the timeline's mobile divider, photo-first order and Feature display
  - removed the 104px first-entry gap
  - icon/photo baseline (8px per entry)
  - article list spacing (14/16px items, last item +28px, list −12px on mobile)
  - title-banner mobile spacing
  - breaker −7px on mobile
  - the community neighbour spacing

**DAM:** package `admiral-xwalk-images-1.1.0.zip` holds 66 assets, including the `about-us/` subfolder. Install it in place of 1.0.0.

**Go-live order:**
1. Install package 1.1.0 and reprocess the assets.
2. Upload the content.
3. Publish the six child pages so `/query-index.json` lists them. Until then the cards stay on their authored fallback, and the child-page sibling strips stay empty.

## DAM image package 1.2.0 (2026-10-04)
- `stardust/packages/admiral-xwalk-images-1.2.0.zip` holds all 66 images the staged pages reference: 24 in `images/`, 42 in `images/about-us/`. It replaces 1.0.0 (24 assets) and 1.1.0.
- Filter mode is `update`: the package adds and refreshes these assets, and never deletes other assets in the folder.
- Each asset now carries an explicit `renditions` nt:folder node.
- Verified: zip integrity, 203 well-formed XML files, 66/66 content refs present, and every original is a valid image.

## Dynamic cards: page-summary fallback and editor support (2026-10-04)
- **What the published site showed:**
  - `/query-index.json` lists paths only, because GitHub main still has the old `helix-query.yaml`.
  - The pages carry no card-* or template meta. The page model on GitHub predates those fields, so they aren't rendered.
- **Folder mode no longer depends on those.** For each page directly inside the folder, it takes the following, in order:
  1. the index card properties
  2. the page's own head meta: card-title, card-summary, card-link-text, card-order, description, og:image
  3. its first heading, paragraph and image
- Nested sub-folders, nav and footer are excluded.
- **Universal Editor (author):**
  - Folder links come with the site's content-path prefix; the block strips it.
  - Pages are listed from AEM via the folder's Sling JSON (depth 2: jcr:title, jcr:description, image, card-* properties), so authors see the dynamic cards while editing.
  - This mode is untested here, because there is no author access from this environment. If the request fails, the authored cards show.
- An unset folder field (an empty first row) no longer renders as a blank card.
- **Verified locally:**
  - With a paths-only index copied from the published one: 6 cards, current page excluded, descriptions from each page.
  - With a full-property index: the 6 curated cards in Card order.

## Cards from folder block and section names (2026-10-04)
- **New `cards-folder` block** ("Cards (from folder)"):
  - Fields: **Folder** (folder picker), **Number of cards** (default 6), **Order** (Latest first, the default, or Card order) and the cards style options.
  - It has no hand-authored card items. Each card is built from a page in the folder (same summary logic as before), and the current page is excluded.
  - It renders with the cards design: it loads `blocks/cards/cards.css` and adds the `cards`, `cards-wrapper` and `cards-container` classes.
  - In the Universal Editor, an unset folder shows a prompt, so the block stays selectable.
- **Latest first** sorts by the index `lastModified` (author: `cq:lastModified`) and keeps the first N. The published index already carries lastModified.
- **The manual Cards block** lost its folder field: it is hand-authored cards only. A legacy folder row in existing content is still honoured.
- **Content:**
  - The About Us cards are now a single `cards-folder` block: `/about-us`, 6, latest.
  - The child pages' "More about us" strips use the same block (`mobile-image lead-two`).
- **Section names:** every section on the 9 pages now carries a `name` in its section metadata (Universal Editor "Section Name"). The generators derive it from:
  - the block title (plus its heading for hero / teaser / banner)
  - else the first heading
  - else the style label
  - explicit names for "About Us pages", "More about us", "Community cards" and "Sponsorship cards"
- **DAM:** package 1.2.0 still covers every referenced image, including the card images that are referenced only from page metadata. The package builder now also counts metadata Image refs.
- **Verified locally** (real published index copy):
  - About Us: 6 cards, latest first.
  - Child pages: 5 cards, self excluded.
  - Layout identical to the previous cards: thirds / 2-then-3, wrapper padding 0/120 (desktop) and 0/60 (mobile).
  - The card order now follows "latest", by request, so the About Us pod order no longer mirrors live.
