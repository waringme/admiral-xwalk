/**
 * timeline — Admiral "Some milestones along the way" history timeline (replica of
 * www.admiral.com/about-us/our-milestones). Reconstructive container.
 *
 * Model (xwalk container, _timeline.json): one row per milestone item —
 *   cell 1  image    optional <picture>: a square icon (shown above the date) or a landscape
 *                    photo (shown between the title and the text), decided by its aspect ratio
 *   cell 2  display  optional `feature`: the square image also shows on mobile (live: the
 *                    25-year badge, Alfie, the 30-year graphic); plain icons are desktop-only
 *   cell 3  text     <h3> date · <h2> title · <p> text
 * Entries alternate left/right of a centre line on desktop; the line opens with a badge
 * showing the first entry's year (derived from its date heading — runtime text).
 * Authored nodes are moved, never rebuilt (EW1).
 * @ew-exempt badge year — derived from the first date heading (EW5 b)
 */
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

const DISPLAY = ['icon', 'feature'];

function isLandscape(img) {
  const w = Number(img.getAttribute('width')) || img.naturalWidth;
  const h = Number(img.getAttribute('height')) || img.naturalHeight;
  return w && h ? w / h > 1.3 : false;
}

export default function decorate(block) {
  const items = [...block.children].map((row, i) => {
    const item = wrap(`milestone ${i % 2 ? 'right' : 'left'}`);
    moveInstrumentation(row, item);
    const content = wrap('content');
    let media = null;
    let feature = false;
    const nodes = [];
    [...row.children].forEach((col) => {
      if (DISPLAY.includes(col.textContent.trim().toLowerCase()) && !col.querySelector('picture, img, h2, h3')) {
        feature = col.textContent.trim().toLowerCase() === 'feature';
        return;
      }
      const pic = col.querySelector('picture') || col.querySelector('img');
      const hasText = [...col.querySelectorAll('h1, h2, h3, h4, p')]
        .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
      if (pic && !hasText) media = pic;
      else nodes.push(...col.children);
    });
    const date = nodes.find((n) => n.tagName === 'H3');
    const title = nodes.find((n) => n.tagName === 'H2');
    const rest = nodes.filter((n) => n !== date && n !== title);
    const icon = wrap(feature ? 'icon feature' : 'icon');
    const photo = wrap('photo');
    content.append(icon);
    if (date) content.append(wrap('date', date));
    if (title) content.append(wrap('title', title));
    content.append(photo);
    rest.forEach((n) => content.append(n));
    if (media) {
      const img = media.tagName === 'IMG' ? media : media.querySelector('img');
      // landscape photos sit under the title, square icons above the date; without
      // intrinsic size attributes, decide once the image has loaded
      const place = () => (img && isLandscape(img) ? photo : icon).append(media);
      if (!img || img.getAttribute('width') || img.complete) place();
      else {
        icon.append(media);
        img.addEventListener('load', place, { once: true });
      }
    }
    item.append(content);
    return item;
  });

  const line = wrap('timeline-line', ...items);
  const firstDate = items[0] && items[0].querySelector('.date');
  const year = firstDate ? (firstDate.textContent.match(/\b(19|20)\d{2}\b/) || [])[0] : null;
  if (year) line.dataset.year = year;
  block.replaceChildren(line);
}
