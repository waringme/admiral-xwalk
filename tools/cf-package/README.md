# Travel landing pages — content fragment package

This package holds the content shared by the SEO (`/travel-insurance`) and PPC (`/travel-insurance/generic`) landing pages. It covers the content that is the same and only laid out differently on each page. The scope is in `stardust/travel-landing-cf-scope.md`.

Build with `python3 tools/cf-package/build.py`. The output is `dist/admiral-xwalk-travel-cf-<version>.zip`.

| What | Where |
|---|---|
| Models | `/conf/admiral-xwalk/settings/dam/cfm/models/`: `feature`, `feature-list`, `cover-level`, `cover-levels` |
| Fragments | `/content/dam/admiral-xwalk/fragments/travel/`: `key-benefits`, `cover-features`, `cover-levels` (+ `features/`, `levels/`) |
| GraphQL | endpoint `/content/cq:graphql/admiral-xwalk/endpoint`; persisted queries `admiral-xwalk/feature-list-by-path`, `admiral-xwalk/cover-levels-by-path` |
| Data | `fragments/**.json` (generated from the live pages; SEO wording, PPC illustrations) |

## Install (AEM author)
1. **Images:** install `stardust/packages/admiral-xwalk-images-1.5.0.zip` first. It holds the icons and illustrations that the fragments reference.
2. **This package:** install it with Package Manager.
3. **Configuration Browser** › `admiral-xwalk`: make sure **Content Fragment Models** and **GraphQL Persistent Queries** are enabled. The package creates the folders but cannot tick those boxes on an existing configuration.
4. **Publish** the models, the fragments (with their referenced fragments and images), the GraphQL endpoint and the two persisted queries.

## Delivery
- The site reads the fragments from the publish tier, `publish-p147324-e2050468`. CORS for this site's origin was verified on 2026-10-09.
- To use another publish host, set the page metadata `aem-publish-host`.
- In the Universal Editor the block reads from author, and the fragment fields are editable in place.
