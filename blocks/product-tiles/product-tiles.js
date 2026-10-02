/**
 * product-tiles — Admiral homepage product grid: 12 linked tiles, icon + label
 * (replica of www.admiral.com). Reconstructive container (stardust/eds-schema/index.json).
 *
 * Model (xwalk container, _product-tiles.json): one row per product-tile item —
 *   cell 1  icon   icon key (car-insurance, home-insurance, …) — rendered as the live vector
 *   cell 2  link   the tile link (<a href>label</a>)
 * The whole tile is the click target: the authored label paragraph is moved into the tile
 * anchor and its inner link unwrapped after reading the href (EW6).
 * @ew-exempt <p> icon key (cell 1) — text-as-metadata, never displayed
 */
/** Universal Editor: move the row's instrumentation (data-aue-*, data-richtext-*) to the item
 * element that replaces it — same contract as scripts.js moveInstrumentation, inlined so the
 * block is self-contained. */
function moveInstrumentation(from, to) {
  [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
    .forEach((attr) => {
      to.setAttribute(attr, from.getAttribute(attr));
      from.removeAttribute(attr);
    });
}

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells.find((c) => !c.querySelector('a'));
    const linkCell = cells.find((c) => c.querySelector('a'));
    const link = linkCell ? linkCell.querySelector('a') : null;
    if (!link) return;
    const key = iconCell ? iconCell.textContent.trim().toLowerCase().replace(/\s+/g, '-') : '';

    const tile = document.createElement('a');
    tile.className = 'product-grid-item';
    tile.href = link.getAttribute('href');
    moveInstrumentation(row, tile);
    const content = document.createElement('div');
    content.className = 'product-grid-content';
    const icon = document.createElement('div');
    icon.className = `product-grid-icon product-grid-icon-${key}`;
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('div');
    label.className = 'product-grid-text';
    const par = link.closest('p');
    if (par) {
      label.append(par);
      link.replaceWith(...link.childNodes);
    } else {
      label.append(...link.childNodes);
      link.remove();
    }
    content.append(icon, label);
    tile.append(content);
    grid.append(tile);
  });
  block.replaceChildren(grid);
}
