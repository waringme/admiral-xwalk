# Fragment

Includes a separately authored Edge Delivery page fragment inside the current page.

| Fragment | |
| --- | --- |
| Reference | Link to a fragment page or its site path |

- Choose or enter a fragment path beginning with `/`. The block also accepts a link in the authored row.
- The fragment is requested as `.plain.html`, decorated using the site's normal page decoration and section loading, then inserted into the block.
- Fragment-relative `media_` image references are resolved against the fragment's own path.
- If the reference is missing or the fragment cannot be loaded, no fragment content is inserted.

This is distinct from **Content Fragment**, which queries AEM Content Fragments and renders model-specific layouts.

`fragment.js`, `fragment.css`, `_fragment.json`
