<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-02T16:52:17.180Z · input stardust/current/_dynamics.json (3 pages, 15 findings) · target probe https://main--admiral-xwalk--waringme.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-experimentation-a-b-personalisation | A | experimentation: A/B / personalisation | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which experiments move to the new host |  |
| 2 | a-unknown-third-party-host-api-cdn-euw2-pure-cloud | A | unknown third-party host api-cdn.euw2.pure.cloud | 3/3 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 3/3 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-cms-app-settings-object-drupalsettings | A | CMS / app settings object drupalSettings | 1/3 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 5 | i18n-locale-variants-gb | I18N | locale variants gb | 1/3 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 6 | t-consent-trustarc-iab-cmp | T | consent: TrustArc / IAB CMP | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 7 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 8 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 9 | t-unknown-third-party-host-mktgblobpubaccess1-blob-core-wind | T | unknown third-party host mktgblobpubaccess1.blob.core.windows.net | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 10 | t-unknown-third-party-host-d34r8q7sht0t9k-cloudfront-net | T | unknown third-party host d34r8q7sht0t9k.cloudfront.net | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 11 | t-chat-live-chat-widget | T | chat: live chat widget | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 12 | t-rum-new-relic | T | RUM: New Relic | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 13 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 14 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 15 | x-sign-in-account-links | X | sign-in / account links | 3/3 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 2 row(s) — read-settings.
- **One owner decision batch:** 12 row(s) — which experiments move to the new host · inspect the XHR, add a vendor row · scope of the locale trees · CMP domain script reuse on the new host · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **tags** — 10
- **detect** — 3
- **locale wave** — 1
- **register** — 1
