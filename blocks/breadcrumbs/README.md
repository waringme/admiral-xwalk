# Breadcrumbs

An authored breadcrumb trail for inner pages. The block wraps the authored ordered or unordered list in a labelled navigation landmark.

| Breadcrumbs | |
| --- | --- |
| Trail (list of links) | `<ul>` or `<ol>` with one item per crumb |

- Add ancestor pages as links and show the current page as text rather than a link.
- CSS supplies the separators; do not type separator characters into each item.
- The list is moved into the block layout without rebuilding its links.

## Accessibility

The trail is exposed as `<nav aria-label="Breadcrumb">`. Ensure every link has descriptive text.

`breadcrumbs.js`, `breadcrumbs.css`, `_breadcrumbs.json`
