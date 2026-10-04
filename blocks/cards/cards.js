/**
 * cards — Admiral "pods": white cards, image strip + heading + copy + arrow link
 * (replica of www.admiral.com). Reconstructive container (stardust/eds-schema: home,
 * about-us, ski hub pods).
 *
 * Model (xwalk container, _cards.json):
 *   container field  folder  optional folder path (e.g. /about-us). When set, the cards are
 *                    built from the site query index: one card per page in that folder
 *                    (the current page excluded), from each page's Card title / Card summary /
 *                    Card link text / Image properties, sorted by Card order. The authored
 *                    card rows stay as the no-JS / index-unavailable fallback (document-first).
 *   one row per card item —
 *     cell 1  image  <picture> (the image strip; hidden on mobile unless `mobile-image`)
 *     cell 2  text   optional <p><strong>tag</strong></p> (painted as a strip on the image) +
 *                    <h3> + <p> + a plain link <p><a>…</a></p> (the arrow "more" link)
 * Variants: `mobile-image` keep the strip on mobile · `two-up` two per row · `lead-two` first
 * two half width, the rest thirds · `narrow` 768px container.
 * Authored nodes are moved, never rebuilt (EW1); row instrumentation moves to the card.
 * @ew-exempt all — folder mode: index-driven listing, authored rows are the fallback (EW5 c)
 */
const INDEX = '/query-index.json';

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

function el(tag, text) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
}

const normalise = (path) => path.replace(/\.html$/, '').replace(/\/$/, '') || '/';

/** a container-field row: one cell, no media or heading, holding a path or a link */
function folderOf(row) {
  if (row.children.length !== 1 || row.querySelector('picture, img, h1, h2, h3, h4')) return null;
  const a = row.querySelector('a');
  const raw = a ? a.getAttribute('href') : row.textContent.trim();
  if (!raw || !raw.startsWith('/')) return null;
  return normalise(new URL(raw, window.location.origin).pathname);
}

function buildCard(row) {
  const pod = wrap('pod');
  const cell = wrap('grid-cell', pod);
  moveInstrumentation(row, cell);
  let image = null;
  [...row.children].forEach((col) => {
    const pic = col.querySelector('picture') || col.querySelector('img');
    const hasText = [...col.querySelectorAll('h1, h2, h3, h4, p, ul')]
      .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
    if (pic && !hasText) {
      image = wrap('image', pic);
      pod.prepend(image);
      return;
    }
    [...col.children].forEach((node, i) => {
      const strong = node.tagName === 'P' && node.querySelector('strong');
      const isTag = i === 0 && strong && node.textContent.trim() === strong.textContent.trim()
        && !node.querySelector('a');
      if (isTag) {
        const slug = node.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        (image || pod).append(wrap(`tag tag-${slug}`, node));
        return;
      }
      const link = node.tagName === 'P' && node.querySelector('a');
      const linkOnly = link && node.textContent.trim() === link.textContent.trim()
        && !node.classList.contains('button-wrapper');
      pod.append(linkOnly ? wrap('more-link', node) : node);
    });
  });
  return cell;
}

function indexCard(entry) {
  const pod = wrap('pod');
  if (entry.image) {
    const img = document.createElement('img');
    img.src = entry.image;
    img.alt = '';
    img.loading = 'lazy';
    const picture = document.createElement('picture');
    picture.append(img);
    pod.append(wrap('image', picture));
  }
  pod.append(el('h3', entry.cardTitle || entry.title));
  const summary = entry.cardSummary || entry.description;
  if (summary) pod.append(el('p', summary));
  const a = el('a', entry.cardLinkText || 'Find out more');
  a.href = entry.path;
  const p = el('p');
  p.append(a);
  pod.append(wrap('more-link', p));
  return wrap('grid-cell', pod);
}

async function fromIndex(folder) {
  const resp = await fetch(`${INDEX}?limit=1000`);
  if (!resp.ok) return [];
  const { data = [] } = await resp.json();
  const canonical = document.querySelector('link[rel="canonical"]');
  const here = normalise(canonical ? new URL(canonical.href).pathname : window.location.pathname);
  return data
    .filter((e) => e.path && e.path.startsWith(`${folder}/`) && normalise(e.path) !== here)
    .sort((a, b) => (Number(a.cardOrder) || 999) - (Number(b.cardOrder) || 999)
      || String(a.cardTitle || a.title).localeCompare(String(b.cardTitle || b.title)));
}

export default async function decorate(block) {
  const grid = wrap('grid');
  let folder = null;
  [...block.children].forEach((row) => {
    const path = folderOf(row);
    if (path && !folder) folder = path;
    else grid.append(buildCard(row));
  });
  block.replaceChildren(grid);
  if (!folder) return;

  block.dataset.folder = folder;
  try {
    const entries = await fromIndex(folder);
    if (entries.length) grid.replaceChildren(...entries.map(indexCard));
  } catch {
    // index unavailable: the authored fallback cards stay
  }
}
