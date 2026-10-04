/**
 * cards — Admiral "pods": white cards, image strip + heading + copy + arrow link
 * (replica of www.admiral.com). Reconstructive container (stardust/eds-schema: home,
 * about-us, ski hub pods).
 *
 * Model (xwalk container, _cards.json):
 *   container field  folder  optional folder (e.g. /about-us). When set, the block lists the
 *                    pages directly inside that folder (the current page excluded), one card
 *                    per page, sorted by Card order then title. Each card takes the page's
 *                    Card title / Card summary / Card link text / Image properties from the
 *                    query index; anything missing is summarised from the page itself (first
 *                    heading, first paragraph, first image). In the Universal Editor (AEM
 *                    author) the folder's child pages are read from AEM instead. The authored
 *                    card rows stay as the no-JS / no-pages fallback (document-first).
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

/** AEM author (Universal Editor): pages are addressed as /content/<site>/… */
const AUTHOR_ROOT = (window.location.pathname.match(/^\/content\/(?!dam\/)[^/.]+/) || [])[0];

/** the site path of an authored link: drops the /content/<site> prefix and .html */
function sitePath(raw) {
  const path = normalise(new URL(raw, window.location.href).pathname);
  const m = path.match(/^\/content\/(?!dam\/)[^/]+(\/.*)?$/);
  return m ? m[1] || '/' : path;
}

/** a container-field row: one cell, no media or heading, holding a path or a link */
function folderOf(row) {
  if (row.children.length !== 1 || row.querySelector('picture, img, h1, h2, h3, h4')) return null;
  const a = row.querySelector('a');
  const raw = a ? a.getAttribute('href') : row.textContent.trim();
  if (!raw || !raw.startsWith('/')) return null;
  return sitePath(raw);
}

/** an unset folder field still renders as an empty one-cell row (items carry a resource) */
const isEmptyFieldRow = (row) => row.children.length === 1 && !row.textContent.trim()
  && !row.querySelector('picture, img') && !row.hasAttribute('data-aue-resource');

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

const usable = (src) => src && !src.startsWith('about:');

/** <picture> for a card image; Edge Delivery media get the usual optimised renditions */
function cardPicture(src) {
  const url = new URL(src, window.location.href);
  const pic = document.createElement('picture');
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  if (url.origin === window.location.origin && /\/media_/.test(url.pathname)) {
    const source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = `${url.pathname}?width=750&format=webply&optimize=medium`;
    pic.append(source);
    const format = url.pathname.endsWith('.png') ? 'png' : 'jpg';
    img.src = `${url.pathname}?width=750&format=${format}&optimize=medium`;
  } else {
    img.src = url.href;
  }
  pic.append(img);
  return pic;
}

function indexCard(entry) {
  const pod = wrap('pod');
  if (usable(entry.image)) pod.append(wrap('image', cardPicture(entry.image)));
  pod.append(el('h3', entry.cardTitle || entry.title));
  const summary = entry.cardSummary || entry.description;
  if (summary) pod.append(el('p', summary));
  const a = el('a', entry.cardLinkText || 'Find out more');
  a.href = entry.href || entry.path;
  const p = el('p');
  p.append(a);
  pod.append(wrap('more-link', p));
  return wrap('grid-cell', pod);
}

/**
 * fill what the index lacks from the page itself: its card properties and description
 * (head meta), else its first heading, paragraph and image
 */
async function summarise(entry) {
  if ((entry.cardTitle || entry.title) && (entry.cardSummary || entry.description)
    && usable(entry.image)) return entry;
  const out = { ...entry, image: usable(entry.image) ? entry.image : '' };
  try {
    const resp = await fetch(entry.path);
    if (!resp.ok) return out;
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const base = new URL(entry.path, window.location.origin);
    const meta = (name) => doc.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      ?.getAttribute('content')?.trim();
    const sections = [...doc.querySelectorAll('main > div')]
      .filter((s) => !s.querySelector('.breadcrumbs, .metadata'));
    const find = (sel, test = () => true) => sections
      .map((s) => [...s.querySelectorAll(sel)].find(test)).find(Boolean);
    const heading = find('h1') || find('h2, h3');
    const para = find('p', (n) => n.textContent.trim().length > 30 && !n.querySelector('picture, img'));
    const img = find('img', (n) => usable(n.getAttribute('src')));
    const ogImage = meta('og:image');
    out.cardTitle ||= meta('card-title');
    out.cardSummary ||= meta('card-summary');
    out.cardLinkText ||= meta('card-link-text');
    out.cardOrder ||= meta('card-order');
    if (!out.title && heading) out.title = heading.textContent.trim();
    out.description ||= meta('description') || para?.textContent.trim();
    if (!out.image && usable(ogImage)) out.image = new URL(ogImage, base).pathname;
    if (!out.image && img) out.image = new URL(img.getAttribute('src'), base).pathname;
  } catch {
    // page unreadable: keep what the index had
  }
  return out;
}

const byOrder = (a, b) => (Number(a.cardOrder) || 999) - (Number(b.cardOrder) || 999)
  || String(a.cardTitle || a.title).localeCompare(String(b.cardTitle || b.title));

/** published site: the folder's direct child pages from the query index */
async function fromIndex(folder) {
  const resp = await fetch(`${INDEX}?limit=1000`);
  if (!resp.ok) return [];
  const { data = [] } = await resp.json();
  const canonical = document.querySelector('link[rel="canonical"]');
  const here = normalise(canonical ? new URL(canonical.href).pathname : window.location.pathname);
  const prefix = folder === '/' ? '/' : `${folder}/`;
  const pages = data.filter((e) => e.path && e.path.startsWith(prefix) && e.path !== prefix
    && !e.path.slice(prefix.length).includes('/') && normalise(e.path) !== here
    && !/^\/(nav|footer)$/.test(e.path));
  return (await Promise.all(pages.map(summarise))).sort(byOrder);
}

/** Universal Editor (AEM author): the folder's child pages and their page properties */
async function fromAuthor(folder) {
  const root = `${AUTHOR_ROOT}${folder === '/' ? '' : folder}`;
  const resp = await fetch(`${root}.2.json`);
  if (!resp.ok) return [];
  const json = await resp.json();
  const here = normalise(window.location.pathname);
  return Object.entries(json)
    .filter(([, v]) => v && v['jcr:primaryType'] === 'cq:Page' && v['jcr:content'])
    .map(([name, v]) => {
      const c = v['jcr:content'];
      return {
        path: `${root}/${name}`,
        href: `${root}/${name}.html`,
        title: c['jcr:title'] || name,
        description: c['jcr:description'],
        image: c.image,
        cardTitle: c['card-title'],
        cardSummary: c['card-summary'],
        cardLinkText: c['card-link-text'],
        cardOrder: c['card-order'],
      };
    })
    .filter((e) => normalise(e.path) !== here)
    .sort(byOrder);
}

export default async function decorate(block) {
  const grid = wrap('grid');
  let folder = null;
  [...block.children].forEach((row, i) => {
    const path = folderOf(row);
    if (path && !folder) folder = path;
    else if (!(i === 0 && isEmptyFieldRow(row))) grid.append(buildCard(row));
  });
  block.replaceChildren(grid);
  if (!folder) return;

  block.dataset.folder = folder;
  try {
    const entries = AUTHOR_ROOT ? await fromAuthor(folder) : await fromIndex(folder);
    if (entries.length) grid.replaceChildren(...entries.map(indexCard));
  } catch {
    // listing unavailable: the authored fallback cards stay
  }
}
