# Cards Folder

An index-driven listing of pages rendered with the Cards block design. Unlike **Cards**, this block has no hand-authored card items.

| Cards Folder | |
| --- | --- |
| Folder | Folder to list |
| Number of cards | Maximum results (default 6) |
| Category filter (optional) | Category value |

- Select a folder to list its pages; the current page is omitted. Page title, summary, link text and image use card-specific page properties when available, with page metadata and the first image as fallbacks.
- Choose **Category filter** to limit results to that category. **Include sub-folders** includes pages found beneath nested folders.
- **Sort by Card order** uses the Card order page property; otherwise results are ordered latest first.
- Presentation styles are shared with Cards: **Show image on mobile**, **Two per row**, **First two wide, then thirds**, **Narrow column**, **Horizontal**, and **Title and link only**.
- With no folder selected, Universal Editor shows an author prompt. An empty result set can show a no-pages prompt in the editor.

This block loads the Cards stylesheet and uses the shared folder-listing helper. Listing content comes from page metadata/index data rather than authored rows.

`cards-folder.js`, `cards-folder.css`, `_cards-folder.json`; shared presentation: `../cards/`
