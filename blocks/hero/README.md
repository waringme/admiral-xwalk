# Hero

A page hero with a large background image, a contrasting copy panel and optional call to action.

| Hero | |
| --- | --- |
| Image | Desktop background image |
| Mobile Image (optional) | Mobile image |
| Text | Heading, paragraphs and optional CTA |

- Use **Text** for the page heading and supporting copy. Add a CTA link in the rich text when required.
- **Image** supplies the desktop hero. An optional **Mobile Image** appears above the copy on small screens. Add alt text for informative images; the landing variant uses the image as a decorative section background.
- Styles: **Panel left**, **Landing (centred copy over a composite image, ice blue)**, and **Large buttons**.
- **Panel left** positions the desktop copy panel on the left. **Landing** places centred copy on the section background and uses the mobile image beneath the copy.
- The desktop image is given eager loading priority because it is above the fold.

## Accessibility

Preserve the intended page heading level in the rich-text field. Use descriptive alt text for meaningful hero imagery.

`hero.js`, `hero.css`, `_hero.json`
