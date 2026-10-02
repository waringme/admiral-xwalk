---
_provenance:
  writtenBy: stardust:replica
  mode: bounded-single
  writtenAt: 2026-10-02T16:56:46Z
  againstInput: https://www.admiral.com/
  synthesizedFrom:
    - stardust/current/pages/index.json
    - stardust/current/pages/about-us.json
    - stardust/current/pages/travel-insurance-ski-festivals.json
    - stardust/replica/tokens.json
---

# Design — Admiral (captured current state = target)

Preserve mode: the target is the live design. Values come from the Phase-3 CSS lift
(`stardust/replica/tokens.json`). The only permitted deltas are the applied entries in
`stardust/replica/inconsistency-register.md`; there are none.

## Typography
- Brand face **jaf-facitweb** (Adobe Fonts kit `mcu8nnf`, licensed). Body weight 300 on a 9px
  root. Headings weight 600 in #2350a0.
- The mobile nav uses aktiv-grotesk, from the same kit.
- Type ramp (mobile → desktop at 768px):
  - h2: 21.6/30 → 37.8/48
  - h3: 16.2/24 → 19.8/28
  - p: 14.4/22 → 18/28
  - Negative top margins plus bottom padding set the rhythm.
- Antialiased/grayscale font smoothing everywhere.

## Color
- Page #f0f0eb, text #4f4f4f, links #0078ff, navy panels #0c3a84, pale blue #82c8ff.
- Product tiles #77ddff with #005485 ink.
- Award band #091f30. Testimonial orange #ee5615 / #ff7911.
- Footer #000 / #282828.
- Utility bar #000 with yellow (#ffdf43) and rubine (#c20060) items.

## Layout
- One layout breakpoint (768px).
- Content container 1024px; narrow text 768px; chrome max 1200px.
- Mobile gutters 10px.
- Hero B: fluid height 30vw, clamped 420–510px. A 522px navy panel is centered vertically, set
  left or right per variant.
- On mobile the hero image stacks above the copy (37vw, or 62.5vw for the bespoke image).

## Components
- **Product tile grid:** 4 columns × 3 rows with 10px gaps, 8px radius; a single column on mobile.
- **Pods:** white, 1px #b7b7cb border, 4px radius, 140px image strip. The more-link is pinned to the
  bottom.
- **Sub-hero banner:** image (28.76%) plus copy (68.7%); stacked on mobile.
- **Award band** and **testimonial carousel** (slick, arrows, 0.5s).
- **Buttons:** green-gradient hero CTA, aqua-gradient midi CTA, navy Make a claim.

## Motion (observed only)
- Product-tile hover: lift 2px, lighter background, shadow, over 0.3s.
- Desktop nav-link hover: white background.
- Carousel: 0.5s slide on arrow click; no autoplay.
- Header: static, no scroll morph, no entrance animations.
