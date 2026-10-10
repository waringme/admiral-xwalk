# Travel landing pages — shared content scope (SEO vs PPC)

**Pages compared:** SEO `https://www.admiral.com/travel-insurance` and PPC `https://www.admiral.com/travel-insurance/generic`, both captured live on 2026-10-09.

**Rule (client brief):** if the content is the same and only the layout differs, the content becomes an **AEM Content Fragment**. Each page renders it with the **content-fragment** block, in its own layout.

## Section-by-section

| # | Topic | SEO page | PPC page | Same content? | Same layout? | Decision |
|---|---|---|---|---|---|---|
| 1 | Hero headline + CTAs | "Ready to see the world?…", Start my quote + Log in | "Get the right cover for your next holiday", Start my quote + 2 links | No (different message per channel) | Similar | Page content (channel-specific) |
| 2 | Key benefits (3 pods) | Medical £20 million · Belongings £3,000 · 5-star Defaqto; blue pods, no icons | Medical £20m · Belongings £3K · Five star; pink/yellow/orange pods with icons | **Yes**: same three benefits and facts, wording varies | **No** | **Content Fragment** `travel/key-benefits` (SEO wording), shown as *blue pods* (SEO) and *colour pods with icons* (PPC) |
| 3 | What's travel insurance? | Text + bullet list, Annie (arms folded) | Two paragraphs, Annie (pointing) | Same topic, different copy | **Yes** (side image) | **Content fragment** (Media Text model, `travel/whats-travel-insurance`, SEO copy) since 2026-10-10; was the page fragment `/fragments/travel/whats-travel-insurance` |
| 4 | What does travel insurance cover? | 5 features in boxed cards with badge icons | 5 features in an alternating layout with large illustrations | **Yes**: the same five covers, PPC copy slightly longer | **No** | **Content Fragment** `travel/cover-features` (SEO wording; each feature has a badge *and* an illustration), shown as *boxed* (SEO) and *alternating* (PPC) |
| 5 | Choose from three levels of cover | Good to know + 9-row table (£1,500 …) | Intro + Good to know + the same 9 rows, abbreviated (£1.5K …), different row order, plus upgrade notes | **Yes**: identical figures | Yes (table) | **Content Fragment** `travel/cover-levels` (the full figures, one source of truth); PPC keeps its upgrade notes as page copy |
| 6 | What isn't covered | 9 bullets in an FAQ pod | 10 bullets in an FAQ pod, reworded | Mostly the same list, different wording | Yes | Page content (copy diverges). *Candidate for a later fragment once the copy is agreed.* |
| 7 | Pre-existing conditions | Long section with 3 pods | Shorter text section | No | No | Page content |
| 8 | FAQs | 6 questions | 2 different questions | No | Similar | Page content |
| 9 | SEO-only sections | Add-ons, cheaper cover, experts, cost, quote, claim, reviews, other options | — | — | — | Page content (SEO page only) |

## Content Fragment models
Stored in `/conf/admiral-xwalk/settings/dam/cfm/models`.

| Model | Fields |
|---|---|
| **Feature** | title, description (rich text), icon (image), illustration (image), alt text |
| **Feature list** | title, introduction (rich text), features (fragment references → Feature, ordered), footnote (rich text) |
| **Cover level** | benefit, admiral, gold, platinum (`x` = not included) |
| **Cover levels** | title, introduction (rich text), good to know (rich text), column headings (3), levels (fragment references → Cover level, ordered) |

## Fragments
Stored in `/content/dam/admiral-xwalk/fragments/travel`:
- `key-benefits`: Feature list with 3 features
- `cover-features`: Feature list with 5 features
- `cover-levels`: Cover levels with 9 rows
- one Feature fragment per item, and one Cover level fragment per row, in sub-folders `features/` and `levels/`

## Delivery
- **GraphQL:** endpoint `/content/cq:graphql/admiral-xwalk/endpoint`, with persisted queries `admiral-xwalk/feature-list-by-path` and `admiral-xwalk/cover-levels-by-path`.
- **Who serves it:** the AEM publish tier (`publish-p147324-e2050468`) for the site, and AEM author in the Universal Editor.
- **CORS:** verified on 2026-10-09. The publish tier answers this site's origin (`access-control-allow-origin: https://main--admiral-xwalk--waringme.aem.page`).
- **The block:** `blocks/content-fragment` has a fragment picker and a **Display** style:
  - *Boxed list*, *Alternating*, *Pods (blue)* and *Pods (colours)* for feature lists
  - *Table* for cover levels
- **In the Universal Editor**, the rendered fragment fields are instrumented, so they can be edited in context.
