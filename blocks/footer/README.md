# Footer

The shared site footer, populated from the authored `/footer` document or the page's Footer property.

| Footer document | |
| --- | --- |
| Explore section | Heading and one list per link column |
| Social section | List of social profile links |
| Legal section | Legal links, copyright and registration text |

- Author footer sections in the order above. The explore section can contain an `<h2>` and multiple `<ul>` link columns.
- Add one social link list; link text supplies the accessible name while supported networks are rendered with branded icons.
- The legal section uses its first list as legal links and paragraphs for registration/address information.
- Footer content is loaded as a page fragment and moved into the footer layout.

## Accessibility

Use clear link text. Social links retain visually hidden text labels. The explore navigation is labelled by its heading.

`footer.js`, `footer.css`; authored content: `/footer`
