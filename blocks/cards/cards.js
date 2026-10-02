/**
 * cards — Admiral "pods": 3-up white cards, image strip + heading + copy + arrow link
 * (replica of www.admiral.com). Reconstructive container (stardust/eds-schema: home,
 * about-us, ski hub pods).
 *
 * Model (xwalk container, _cards.json): one row per card item —
 *   cell 1  image  <picture> (the 140px strip; hidden on mobile unless `mobile-image`)
 *   cell 2  text   <h3> + <p> + a plain link <p><a>…</a></p> (the arrow "more" link)
 * Variant `mobile-image`: keep the image strip on mobile (About Us hub pods).
 * Authored nodes are moved, never rebuilt (EW1); row instrumentation moves to the card.
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

function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const grid = wrap('grid');
  [...block.children].forEach((row) => {
    const pod = wrap('pod');
    const cell = wrap('grid-cell', pod);
    moveInstrumentation(row, cell);
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture') || col.querySelector('img');
      const hasText = [...col.querySelectorAll('h1, h2, h3, h4, p, ul')]
        .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
      if (pic && !hasText) {
        pod.prepend(wrap('image', pic));
        return;
      }
      [...col.children].forEach((node) => {
        const link = node.tagName === 'P' && node.querySelector('a');
        const linkOnly = link && node.textContent.trim() === link.textContent.trim()
          && !node.classList.contains('button-wrapper');
        pod.append(linkOnly ? wrap('more-link', node) : node);
      });
    });
    grid.append(cell);
  });
  block.replaceChildren(grid);
}
