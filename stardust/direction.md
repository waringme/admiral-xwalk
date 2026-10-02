---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-02T16:56:46Z
  againstInput: https://www.admiral.com/
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/pages/about-us.json
    - stardust/current/pages/travel-insurance-ski-festivals.json
    - stardust/replica/tokens.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.admiral.com/
(no direct invocation, no creative decisions).

Synthesized (bounded-single): current/pages/{index,about-us,travel-insurance-ski-festivals}.json
+ Phase-3 CSS lift (stardust/replica/tokens.json) → PRODUCT.md · DESIGN.md · DESIGN.json
(at 2026-10-02T16:56:46Z). Bounded entry: `extract --pages /,/about-us,/travel-insurance/ski-festivals
--dynamics`. A later site-scope run re-runs Phase 1 with `--prep`, and its verbatim promotion
replaces this synthesized spec.

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(4 entries, all deferred; none applied — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Archetypes (one per page type, from the site-scope catalog `catalog/template-catalog.json`):
product-landing → `/` · hub-landing → `/about-us` · finder-intro → `/travel-insurance/ski-festivals`.

Fonts: Admiral's own Adobe Fonts kit `mcu8nnf` is referenced from Adobe's CDN (it serves to
localhost). No font files are copied or rehosted. The EDS domains must be added to the kit's
allowed domains before launch (owner decision batch, stardust/dynamic-features.md).
