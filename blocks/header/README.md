# Header

The site navigation and brand header. Its content is authored in a separate `/nav` page (or the page's Navigation property); PPC pages can use the `/nav-ppc` fallback.

| Navigation document | |
| --- | --- |
| Utility section | Utility links |
| Brand section | Home link and logo |
| Main navigation section | Top-level links and optional dropdowns |
| Mobile extras section (optional) | Additional mobile menu links |
| Quick actions section (optional) | Mobile quick-action bar |

- Keep the sections in the documented order. The brand section is identified by the home link rather than relying solely on its position.
- Top-level list items can contain a nested list of dropdown columns. A column can have a bold subtitle and link list; a non-list column becomes the dropdown CTA panel.
- Utility links, dropdown links, brand link and quick actions should be authored with meaningful text and destinations.
- The header creates a mobile menu toggle and desktop dropdown controls. Dropdowns open on click; desktop opening also displays a page blackout. The header does not morph on scroll.
- The logo image is supplied by code if the authored home link has no image or SVG.

## Accessibility

The menu toggle exposes `aria-expanded` and `aria-controls`. Provide clear link labels and keep the authored logo's alternative text meaningful.

`header.js`, `header.css`; authored content: `/nav` or `/nav-ppc`
