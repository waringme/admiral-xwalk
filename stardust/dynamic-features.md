<!-- stardust provenance: skill=stardust:replica (Phase 2 step 4, dynamics Phases 1–3) · 2026-10-02 · input stardust/current/_dynamics.json (3 archetypes, 15 findings) + stardust/dynamics/dynamic-features.generated-plan.md (target probe https://main--admiral-xwalk--waringme.aem.page) + stardust/replica/motion/*.json · curated: duplicates merged, asset CDN reclassified, prototype-implemented widgets added -->
# Dynamic features — www.admiral.com (bounded replica: product-landing, hub-landing, finder-intro)

## Listings contract

none — the three archetypes carry no index-fed listing blocks. The homepage pods and the hub/finder
pods are authored cards (document-first), not query-index listings.

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | w-mega-nav | header mega-nav: click-open dropdowns (desktop) + blackout, mobile Menu panel | X | 3/3 | rebuild-native | self | implemented (prototype) | widget | — | motion/index.json; lift/index/tree-menu-{1440,360}.json; js/motion.js |
| 2 | w-testimonials-carousel | testimonials slider (slick infinite, arrows, 0.5s transform, no autoplay) | X | 1/3 | rebuild-native | self | implemented (prototype) | widget | — | motion/index.json widget poke; runtime loop clones mirrored |
| 3 | w-hover-tiles | product-tile hover lift + nav-link hover | X | 1/3 · 3/3 | rebuild-native | self | implemented (prototype) | hover | — | motion/index.json hoverSamples |
| 4 | a-cms-settings | CMS/app settings objects (dataLayer, drupalSettings) | A | 3/3 · 1/3 | static-snapshot | self | pending | read-settings | — keys name tag ids/vendors; read once at rollout D2, nothing to render | _dynamics.json |
| 5 | t-consent-trustarc | consent manager TrustArc / IAB CMP (incl. floating cookie-preferences badge #teconsent) | T | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain/script reuse on the EDS host | _dynamics.json; gate residual (badge in live captures) |
| 6 | t-tag-managers | tag managers: Adobe Launch + Google Tag Manager | T | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids | _dynamics.json |
| 7 | t-analytics-marketing | Google Analytics/Ads, ad/retargeting pixels, New Relic RUM, adalyser, A/B/personalisation | T · A | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags/experiments move; property ids | _dynamics.json (rows 1, 12–14 merged) |
| 8 | t-chat-genesys | live chat widget (Genesys Cloud — api-cdn.euw2.pure.cloud, #genesys-messenger) | T | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | deployment id + allowed origins on the EDS host | _dynamics.json (rows 2, 11 merged) |
| 9 | t-unknown-cloudfront | unknown third-party host d34r8q7sht0t9k.cloudfront.net | T | 3/3 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR; add a vendor row — undecided, revisit at rollout | _dynamics.json |
| 10 | m-asset-cdn | brand asset CDN mktgblobpubaccess1.blob.core.windows.net (logos, hero/pod imagery, icons) | M | 3/3 | static-snapshot | self | delivered (prototype assets) | media | — assets re-hosted as authored media at deploy | stardust/prototypes/assets/img (36 files, all HTTP 200) |
| 11 | i18n-locale-gb | locale variant en-GB only | I18N | 1/3 | rebuild-native | needs-business-decision | pending | locale-tree | confirm single-locale scope (no locale tree) | _dynamics.json |
| 12 | x-sign-in | My account / sign-in links to myaccount.admiral.com | X | 3/3 | decided-out | needs-backend | decided | decided-out | — link migrated, no on-site auth | header links |

## Decision batch

One message to the site owner — everything below gates on something external:

- **Tags & consent (rows 5–7):** which tags (Adobe Launch property, GTM container, GA/Ads, pixels,
  New Relic, adalyser, experiments) run on the EDS host, with their property ids; whether the
  TrustArc CMP script/domain is reused there. Interim: none loaded on the replica.
- **Chat (row 8):** Genesys Cloud deployment id and the EDS origins to allow-list.
- **Unknown host (row 9):** what d34r8q7sht0t9k.cloudfront.net serves (inspect at rollout).
- **Locale (row 11):** confirm en-GB single locale (no locale tree).
- **Fonts (not a dynamic row, same batch):** add the EDS preview/live domains to Adobe Fonts kit
  `mcu8nnf` (jaf-facitweb, aktiv-grotesk) — the replica references the kit, never rehosts it.

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| on-site sign-in | authentication lives on myaccount.admiral.com | "My account" stays an outbound link; no auth on the EDS site |
