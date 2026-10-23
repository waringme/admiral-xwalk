# Cards

Admiral content cards. Cards can be authored individually or generated from pages in a selected folder.

| Cards block | |
| --- | --- |
| Folder (optional) | Count, category and styles |
| Card (repeatable) | Image (optional) |
| | Text: optional tag, heading, summary and optional link |

- Leave **Folder** empty to use the authored **Card** items. Each card can have an image and rich text; include a heading and a link in the text for a useful navigable card.
- When a folder is selected, the block reads child-page card properties from the query index; in Universal Editor, child pages are read from AEM. The current page is excluded, and authored cards are the fallback.
- **Number of cards** sets the folder-listing limit (default 6). **Category filter** optionally filters pages by Category. **Sort by Card order** uses the page Card order property; otherwise folder results are newest first.
- **Include sub-folders** includes pages inside sub-folders, but not the sub-folder landing pages.
- Styles: **Show image on mobile**, **Two per row**, **First two wide, then thirds**, **Narrow column**, **Horizontal**, and **Title and link only**.
- For image-less cards, omit the image field. Card headings and summaries come from authored text or, in folder mode, page properties with title/description fallbacks.

Folder results depend on page metadata and the site's `/query-index.json`; if the index cannot provide cards, authored card items remain the content source.

## Accessibility

Use descriptive heading and link text. Card images are decorative in the rendered card layout and use an empty alt; avoid putting essential information only in an image.

`cards.js`, `cards.css`, `_cards.json`
