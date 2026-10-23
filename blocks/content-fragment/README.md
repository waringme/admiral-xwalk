# Content Fragment

Displays a shared AEM Content Fragment in the current page layout. It supports Feature List, Cover Levels, Cover Comparison, Media Text and Product Pod List models.

| Content Fragment | |
| --- | --- |
| Content fragment | Required fragment picker |
| Selected variation | Set by the picker; blank selects master |
| Display | Optional layout style |

- Pick a fragment under `/content/dam/admiral-xwalk/fragments`. The block reads the selected variation and renders the content according to its fragment model.
- Feature Lists support the default card list, **Alternating**, **Pods (blue)**, **Pods (colours, with icons)**, **Accordion**, **Tabs**, and **Numbered steps**. **Step arrows** modifies the numbered-steps style.
- **Hide heading** applies across fragment types. **Image on the right** is available for Media Text.
- Cover Levels render as a comparison table; Cover Comparison renders tier tables; Media Text renders an image-and-copy panel; Product Pod Lists render product cards.
- Fragment data is fetched from AEM persisted GraphQL queries. On publish, the AEM publish host can be selected using the `aem-publish-host` page metadata.

The block decorates fragments as shared content, rather than treating their fields as page-authored markup. Universal Editor instrumentation is added to fragment content to support editing.

`content-fragment.js`, `content-fragment.css`, `_content-fragment.json`
