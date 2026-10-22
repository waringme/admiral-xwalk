# Tim Teaser

A separately selectable teaser block with the same authoring fields and decoration behavior as **Teaser**, and its own stylesheet scope.

| Tim Teaser | |
| --- | --- |
| Image | Desktop image |
| Mobile Image (optional) | Mobile image |
| Text | Heading, paragraph(s) and CTA or store links |

- Add desktop image, optional mobile image, and copy in the same way as Teaser.
- Styles: **Light**, **Image after copy (mobile)**, and **App store badges**.
- The block reuses Teaser's decorator; its CSS selectors and section spacing use the `tim-teaser` class so the block can be styled independently.

## Accessibility

Follow Teaser guidance: use descriptive alt text for meaningful images and accessible text for CTA/store links.

`tim-teaser.js`, `tim-teaser.css`, `_tim-teaser.json`; shared behavior: `../teaser/`
