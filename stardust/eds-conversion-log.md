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

## Travel demo: landing pages, articles, shared fragments (2026-10-09)
Brief: the client's demo email covers two templates, **Landing pages** and **Articles**. It asks for:
- content shared between the SEO and PPC landing pages
- articles that appear automatically on hubs, landing pages and the homepage, from their teaser fields

**Pages** (content/, demo-grade close match; captured live 2026-10-09):

| Page | Template | Notes |
|---|---|---|
| `/travel-insurance` | landing-page | SEO page, about 30 sections |
| `/travel-insurance/generic` | landing-page | PPC; reduced nav `/nav-ppc` (logo only), `noindex` as live |
| `/resources/travel-hub/travel-planning` | landing-page | hub |
| 7 articles under the hub | article | best-time-to-book-holiday-flight (the email's example) and the 6 the hub links to |

**Shared fragments** (`/fragments/travel/`), placed on both landing pages:
- `whats-travel-insurance`: media-text, Annie from the DAM
- `whats-covered`: features with badges plus the policy-book note
- `levels-of-cover`: "Good to know" callout plus a comparison table
- The SEO wording is used, by decision. On live the PPC page has its own copies, and the SEO page already uses Drupal reusable-block-19398/19399 for two of them.
- `travel-insurance-promo`: the article footer banner (hero `mini`), shared by every article.

**Dynamic listings:**
- the hub lists every article in its folder (cards-folder, latest, 9)
- each article shows "Check out our related articles" (latest 3, itself excluded)
- the SEO landing page gains "Travel tips and guides" (latest 3)
- Each article carries Card Title / Card Summary / Card Link Text from its live hub card, plus Image = its featured image.
- The live hub card for the example article points at an old URL, which is the email's "doesn't link anywhere" point; it is matched by title.

**New blocks:**
- features: boxed / alternating / rows / ticks / steps
- media-text
- comparison-table: rows with label + 3 values, an empty first label = the heading row, `x` = cross
- callout: yellow / blue / white
- accordion: native details
- highlights: blue / colours
- hero `mini` variant

**Article template** (`templates/article`, loaded by scripts.js for Template = article):
- mint title banner
- sticky "Article contents" list built from the body's h2s
- author bar from the page properties Author / Author image / Published / Updated / Read time, with share links

**Section styles:**
- landing-hero: ice blue and centred, with **Image left / Image right** section properties drawn as Alfie and Annie cut-outs
- ice-blue, sky, sea-blue, white, centered, article-title, article-body

**Page model:**
- Template gains Landing page / Article. The About Us community page moves to `content-page`, so `article` now means the magazine template.
- New article fields: Author, Author image, Published, Updated, Read time.

**Header:** a nav with no main menu (`/nav-ppc`) drops the Menu toggle.

**Verified locally** (harness with the page properties as head meta and a mock index built from the metadata):
- 12 pages at 1440 and 360: no overflow, broken images, console errors or unloaded blocks
- fragments load (5 fragment sections on each landing page)
- dynamic cards show 3 on the landing page, 7 on the hub and 3 per article
- Side-by-side with live screenshots: the SEO and PPC pages, the hub and the article match in structure and look.
- Known simplifications:
  - the Trustpilot widget becomes a text line
  - FAQ pods are collapsible (some are open boxes on live)
  - the cost slide-in drawer becomes an accordion item
  - the hub's hand-curated category rows (many linking to articles not imported) are replaced by the dynamic listing
- No pixel gate (demo-grade by decision).

**DAM:** `stardust/packages/admiral-xwalk-images-1.3.0.zip` holds 103 assets, adding `images/travel/`. It is update mode and replaces 1.2.0.

**Go-live order:**
1. Install package 1.3.0, reprocess and publish the images.
2. Push the code.
3. Upload the content (fragments and nav-ppc included).
4. Publish the articles, then the hub and the landing pages.

## Homepage: latest travel articles (2026-10-09)
- The homepage gains "Latest travel tips and guides" after the existing hand-picked cards: a cards-folder block on `/resources/travel-hub/travel-planning`, 3 cards, latest first.
- This completes the email's "hub pages, the homepage and landing pages" listing story.
- Verified locally at 1440 and 360: 3 cards with images, no overflow.

## Travel-planning hub, fully migrated with category listings (2026-10-09)
- **The hub** (`/resources/travel-hub/travel-planning`) now mirrors live:
  - hero (small page-title h1 above the h2 headline)
  - the four category rows: Airports and travel · Prepare for your destination · The practical stuff · What type of trip are you taking?
  - FAQs and Policy books
- **Each row is a cards-folder block** with a Category filter, sorted by Card order (live order).
  - "What type of trip" uses folder `/`, so it also lists the two product pages at their own paths.
  - The earlier "Latest travel planning articles" demo row is removed.

**Card pages imported** (all from live, demo grade):
- **10 more articles**, moved from their old live `/magazine/guides/travel/…` (and `/magazine/travel/…`) URLs into the hub folder. Old URLs in content are rewritten to the new paths. Now 17 articles.
  - hand-luggage-restrictions-faqs, hiring-a-car-abroad, travel-insurance-for-a-holiday-in-the-uk, camping-essentials
  - how-to-get-the-best-exchange-rates-on-travel-money, travel-vaccinations, lost-or-stolen-passport
  - excess-waiver-travel-insurance, travelling-on-budget, travel-insurance-for-a-business-trip
- **2 product pages** (Landing page template), built by a general section converter (`stardust/.work/replica/autoconv.py`):
  - `/travel-insurance/winter-sports-insurance` (live `.php`): cornflower hero with pods, Annie and Alfie side panels, icon-column features, cover tables, FAQs, useful-guide cards, tabs as an accordion
  - `/travel-insurance/destination/uk`: photo hero, tables, FAQs, tabs
- **5 live cards point at removed articles** (they redirect to the homepage) and are not imported:
  - airport parking, planning a skiing holiday, spring breaks, Montenegro, look beyond the frame
  - With the folder listing they are simply absent: the email's "first card doesn't link anywhere" case.

**Category:**
- The new page property **Category** (select) is indexed by helix-query (`category`).
- Every listed page carries Category + Card Order (its live position in its row) and its live card title, summary and link text. Product pages take the hub card image.

**Folder blocks** (cards and cards-folder):
- New **Category filter** field: with a category, the block lists every page with it anywhere under the folder.
  - Published site: from the index.
  - Editor: from the AEM query builder (untested here; no author access).
- **Sort by Card order** moved into Style (option `card-order`; default latest first), keeping the blocks within the 4-field limit. Older content with an Order row is still read.
- Folder settings are read by position (folder, count, category), as AEM renders them.
- Articles' "related articles" are now the newest 3 in the same category.

**Other changes:**
- features `columns` style (live .grid--badges)
- highlights stay dark on pastel pods inside dark heroes
- section style `cornflower`
- the hero's h1 is small when an h2 headline follows

**Verified locally** (mock index built from the page metadata, categories included):
- 24 pages at 1440 and 360, all clean
- each hub row lists its live cards in live order (3 / 2 / 8 / 6)
- related cards follow the category; the homepage's latest 3 draw from all 17 articles
- side-by-side with live: hub and product pages match in structure and look

**DAM:** `stardust/packages/admiral-xwalk-images-1.4.0.zip` holds 133 assets (update mode) and replaces 1.3.0.

## Travel landing pages: shared content as AEM Content Fragments (2026-10-09)
- **Scope:** `stardust/travel-landing-cf-scope.md`. The SEO and PPC pages were compared section by section. Same content in a different layout becomes a Content Fragment:
  - key benefits: blue pods (SEO), colour pods with icons (PPC)
  - cover features: boxed with badges (SEO), alternating with illustrations (PPC; the live PPC layout restored)
  - cover levels: one set of figures (the SEO full values), a table on both pages
- "What's travel insurance?" stays a shared page fragment (same layout, different copy). Exclusions, pre-existing conditions and FAQs stay page copy (different copy).
- **Package:** `tools/cf-package/dist/admiral-xwalk-travel-cf-1.0.0.zip`, from build.py (pattern: waringme/vhi-ie press-release).
  - 4 models: Feature, Feature List, Cover Level, Cover Levels (nested fragment references)
  - 20 fragments
  - GraphQL endpoint + 2 persisted queries
  - Install notes: tools/cf-package/README.md
- **Block:** `blocks/content-fragment` has a fragment picker and a Display style: boxed / alternating / pods / pods-colours / no-heading.
  - It reads the fragment through the persisted queries: the publish tier on the site, author in the Universal Editor.
  - It renders with the features / highlights / comparison-table / callout CSS.
  - It instruments every fragment field (nested fragments as resources) for in-context editing.
- **Pages:**
  - SEO uses key-benefits (pods), cover-features (boxed) and cover-levels.
  - PPC uses key-benefits (pods-colours no-heading, inside the hero), cover-features (alternating) and cover-levels, plus its upgrade notes.
  - The page fragments `whats-covered` and `levels-of-cover` are no longer used.
- **Verified:**
  - The publish GraphQL CORS answers the site origin.
  - Locally with the GraphQL mocked from the fragment data: both pages render all 3 fragments at 1440 and 360, with no errors, overflow or broken images.
  - Side by side with live, the PPC alternating layout and colour pods match live.
  - The other travel pages are unchanged.
- **DAM:** images package 1.5.0 holds 138 assets, including the 13 icons and illustrations the fragments reference.

## Content fragment package 1.0.1 (2026-10-09)
- **Bug:** the Features (Feature List) and Rows (Cover Levels) fragment-reference fields had `valueType="string[]"`. GraphQL typed them as `[String]`, and both persisted queries failed validation on publish ("Subselection not allowed on leaf type [String]").
- **Fix:** they are now `valueType="string/content-fragment[]"`, typed as the referenced models.
- Rebuilt as `tools/cf-package/dist/admiral-xwalk-travel-cf-1.0.1.zip`. Reinstalling replaces the 4 models; then republish the models.

## Travel-planning hub: one sub-folder per row (2026-10-09)
- **Requested:** the hub's sections are dynamic from sub-folders (folder picker per row), replacing the Category filter.
- **Structure:** each row is `/resources/travel-hub/travel-planning/<row>/`:
  - `airports-and-travel` (3)
  - `prepare-for-your-destination` (2)
  - `practical-stuff` (8)
  - `type-of-trip` (6, including the 2 product pages, now `type-of-trip/winter-sports-insurance` and `type-of-trip/travel-insurance-uk`, by decision)
- Each sub-folder is a page of its own: centred title + intro + cards-folder listing it.
- **The hub:** each row is a cards-folder block on its sub-folder, sorted by Card order (live order).
- **Moves:** articles and product pages moved into the sub-folders.
  - In content, live URLs and the earlier paths are rewritten to the new ones.
  - Breadcrumbs gain the sub-folder.
  - Related articles = the newest 3 in the same sub-folder.
- **Folder blocks:** new style **Include sub-folders** (`include-subfolders`). It lists the pages in sub-folders too, leaving out the sub-folder pages themselves. The homepage and SEO landing "latest" lists use it on the hub. The editor uses the query builder when it is set.
- Centred-section h1 sized as a page title.
- **Verified locally** (mock index of the new structure):
  - hub rows 3 / 2 / 8 / 6 in live order
  - sub-folder pages list their row
  - related articles stay within the sub-folder
  - the homepage's latest 3 come from the sub-folders
  - 28 pages clean at 1440 and 360
- **Superseded files to delete before uploading** (the earlier flat layout; content files cannot be deleted from here):
  - 17 `content/resources/travel-hub/travel-planning/<article>.plain.html` at the hub root
  - `content/travel-insurance/winter-sports-insurance.plain.html`
  - `content/travel-insurance/destination/uk.plain.html`
  - `content/fragments/travel/whats-covered.plain.html`
  - `content/fragments/travel/levels-of-cover.plain.html`

## Published-site check after upload (2026-10-10)
- **Published with content (13):** homepage (older version, without the latest travel section), About Us + 6, nav, footer, ski hub, PPC (`/travel-insurance/generic`), travel promo fragment, nav-ppc.
- **Not published (404):** the hub, its 4 category pages, all 19 sub-folder pages, `/fragments/travel/whats-travel-insurance`.
- **`/travel-insurance`** is published but empty (still the 5 October version).
- **`/fragments/travel/whats-covered`** is still published and indexed (retired; unpublish in AEM).

**Found and fixed:**
- **Logo missing site-wide.** AEM keeps the logo link but drops the linked image (`<a href="/"></a>`), and `/nav-ppc` also lost its empty first section on upload.
  - The header now finds the brand section by its home link (not by position).
  - It falls back to `/icons/admiral-logo.svg` when the link has no image.
  - Verified on the published nav and nav-ppc with the local code.
- **Content fragments.** The 1.0.1 package resolves on publish: all 3 fragments return their items. But the SVG icons came back empty: SVG assets are `DocumentRef`, not `ImageRef`.
  - `feature-list-by-path` now selects both. Validated against the publish GraphQL endpoint: all 5 icons resolve.
  - Package `admiral-xwalk-travel-cf-1.0.2.zip`.
- **Page properties dropped by the upload on every page:** template, theme, nav, robots, card fields, category, article author and dates. None appear as head meta.
  - New package `tools/page-props-package/dist/admiral-xwalk-page-properties-1.0.0.zip` sets them on 35 pages from the staged metadata (`merge_properties`: only missing properties are added; page content untouched). Install it after the content upload.
  - The page model gains Navigation (`nav`) and Robots fields so they are visible and editable.
  - The article template now also switches on from the `article-body` section, so articles get the contents list even without the property.

**Published PPC page check, continued (2026-10-10):**
- **The content-fragment block raced the two persisted queries.** AEM answers a by-path query for another model with a partial item (shared fields such as title), so cover-features rendered as an empty table and cover-levels as an empty list.
  - The block now accepts an answer only when the model's own list field (features / levels) is present.
  - Verified with the real publish data: 3 pods, 5 covers (illustrations load), 9 table rows.
- **The PPC "What isn't covered" box** sits outside the live `.wrapper` sections (`#basic-18095`), so the extractor had missed it and the accordion was empty.
  - The extractor now records such stand-alone containers (`extras`, with their position). The PPC accordion is regenerated with the full list.
  - The CSS badge markers it now records are ignored outside the product-page converter.
- **Lists in `narrow` sections** got the article list styles (they rendered at the 9px body size).

**Re-check after "all published" (2026-10-10 09:10 UTC):** nothing on the preview site changed since 2026-10-09 21:29.
- The hub tree (24 pages) and `/fragments/travel/whats-travel-insurance` are still not found. `/travel-insurance` is still the empty 5 October version. No page properties anywhere.
- On the AEM publish tier the hub pages do not exist, and the content fragments still lack the SVG icons, so CF 1.0.2 is not installed.
- **Likely cause:** the parent pages `/resources` and `/resources/travel-hub` were missing, so the hub tree could not be created.
- **Added:**
  - `/resources/travel-hub` (live title and description, plus a folder block listing its hubs)
  - `/resources` (minimal, `noindex`; live has no page there)
- The page-properties package now covers 37 pages.

**Re-check after packages + Publish to Preview (2026-10-10):**
- Page properties now render: templates, the homepage theme, About Us card fields.
- Still missing: the whole hub tree including the new parents, and `/fragments/travel/whats-travel-insurance` (not in AEM).
- `/travel-insurance` is republished but empty in AEM. The PPC content is still the old upload (empty accordion, homepage description).
- The SVG icons are still missing, so the CF 1.0.2 persisted query is not published.
- `nav` does not render as metadata, so the header now also takes the PPC navigation from Header variant **PPC** (`theme=ppc`, a body class). The page-properties package 1.0.1 adds `theme=ppc` to the PPC page.

## Pages not offered by Sync: cause and the page content package (2026-10-10)
- **Cause (found by converting the pages with the platform converters, helix-importer html2md → helix-md2jcr):**
  - md2jcr resolves a block by its component **title**. Five titles differed from the block names: Cards (from folder), Media and text, Comparison table, Table row, Accordion item. So every page using them failed to convert: the hub tree, /travel-insurance, the What's travel insurance fragment.
  - Fixed: the titles now equal the block names (Cards Folder, Media Text, Comparison Table, Table Row, Accordion Item).
  - md2jcr maps page metadata rows to page-model fields **by exact name**. The pages used labels (Template, Card Title, …), which is why the upload dropped every custom page property. The generators now write the field names (template, card-title, …).
- **Package:** `tools/page-content-package/build.mjs` builds `dist/admiral-xwalk-travel-pages-1.0.0.zip`, 30 pages: homepage, /resources, /resources/travel-hub, the travel-planning hub + 4 category pages + 19 pages, /travel-insurance, /travel-insurance/generic and /fragments/travel/whats-travel-insurance.
  - Same converters as the platform, then clean-ups: preview-site URLs back to site and DAM paths; `<p><h3>` unwrapped; folder / fragment / nav references as /content/admiral-xwalk paths; bare `&` escaped; icon shortcodes back to DAM SVGs.
  - Filter roots are each page's jcr:content (replace): child pages and other pages are untouched.
  - Validated: 32 XML files well-formed, block counts equal the source pages, every image ref /content/dam/…

## Trustpilot block (2026-10-10)
- **Block:** `blocks/trustpilot` comes from waringme/admiral (TrustBox Micro Star, Admiral business unit; model templateId / businessUnitId / sku). The wrapper rule is adapted to this site's sections. Also `icons/trustpilot-logo.svg`.
- **Used on:**
  - /travel-insurance: the strip under the hero, plus "Read more about our customers' experiences" (live shows a server-built rating card and a reviews iframe there)
  - /travel-insurance/generic: the strip under the hero (live already uses this exact TrustBox)
  - All use product SKU `Travel_`, as on live PPC.
- **Verified:** the live TrustBox renders (logo + stars + review count) at 1440 and 360.
- **Page content package 1.0.1** carries the updated landing pages (trustpilot fields mapped: templateId, businessUnitId, sku).
