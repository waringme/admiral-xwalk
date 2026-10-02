<!-- stardust provenance: writtenBy=stardust:replica · 2026-10-02 · againstInput=https://www.admiral.com/ (bounded: /, /about-us, /travel-insurance/ski-festivals) · sources: prototype validation loop (stardust/.work/replica/validate.mjs), captured DOM (stardust/current/pages/*.html) · no audit run, no user-supplied items -->
# Inconsistency register — www.admiral.com replica

One entry is applied (R-05, no visual delta); everything else is a pure replica. Everything not listed here is frozen; any design delta found
by the gate is a defect, not an improvement. The entries below were discovered mid-recreation by
the validation loop and are recorded as `deferred` — they change nothing in this run and ride along
as a handover list (the prototypes reproduce the live behaviour exactly).

## R-01 — Homepage has no h1

- **Evidence:** captured headings for `/` start at h2 ("Trust us - we've been insuring cars for over 30 years"); no h1 anywhere in the page (stardust/current/pages/index.json `headings`; validate.mjs "no h1 in main").
- **Finding:** every other archetype has an h1 page title; the homepage's hero headline is an h2 — an accessibility/SEO defect, not a style preference.
- **Minimal change:** promote the hero headline element from h2 to h1 with the same class/styles (no visual change).
- **Status:** deferred
- **Where:** product-landing (homepage) hero

## R-02 — Heading levels skip from h1 to h3

- **Evidence:** /about-us and /travel-insurance/ski-festivals: h1 followed directly by pod/banner h3s, no h2 (captured `headings`; validate.mjs "heading jump h1→h3").
- **Finding:** the heading outline skips a level on hub and finder pages (WCAG 1.3.1 best practice).
- **Minimal change:** change the pod and sub-hero card headings to h2 while keeping their current h3 type styles.
- **Status:** deferred
- **Where:** hub-landing pods, finder-intro sub-hero + pods

## R-03 — Finder pod images have no alt attribute

- **Evidence:** /travel-insurance/ski-festivals pod `<img>` elements carry no `alt` (captured DOM; validate.mjs "img without alt" ×3).
- **Finding:** decorative-or-informative is undeclared; screen readers announce the file name.
- **Minimal change:** add `alt=""` (the pod heading already names each card).
- **Status:** deferred
- **Where:** finder-intro pods

## R-04 — Homepage pod alt text carries stray whitespace

- **Evidence:** first homepage pod image `alt=" Looking after your pet on hot days  "` (captured DOM).
- **Finding:** authored-content typo (leading/trailing spaces), inconsistent with the other two pods.
- **Minimal change:** trim the alt text.
- **Status:** deferred
- **Where:** product-landing pods

## R-05 — App-store badge links have no accessible name

- **Evidence:** homepage app banner: `<a class="apple"><img alt=""></a>` and `<a class="android"><img alt=""></a>` (captured DOM; both links announce as unlabeled).
- **Finding:** the two store links have no accessible name, and image-links cannot be authored in xwalk richtext.
- **Minimal change:** author text links "App Store" / "Google Play"; the teaser `app` variant paints the same badge images and visually hides the label (no visual delta).
- **Status:** applied
- **Where:** product-landing app banner (teaser block, `app` variant)
