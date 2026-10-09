/**
 * cards — Admiral "pods": white cards, image strip + heading + copy + arrow link
 * (replica of www.admiral.com). Reconstructive container (stardust/eds-schema: home,
 * about-us, ski hub pods).
 *
 * Model (xwalk container, _cards.json) — block fields render first as single-cell rows:
 *   folder  optional folder picker (e.g. /about-us). When set, the block lists the pages
 *           directly inside that folder (the current page excluded), one card per page. Each
 *           card takes the page's Card title / Card summary / Card link text / Image properties
 *           from the query index; anything missing is summarised from the page itself (title,
 *           description, first image). In the Universal Editor (AEM author) the folder's child
 *           pages are read from AEM instead. Card items stay as the no-pages fallback.
 *   count   number of folder cards (default 6)
 *   category  optional: only pages with that Category, from anywhere under the folder
 * Style `card-order` sorts by the Card order property; otherwise latest first.
 * The `cards-folder` block is the same listing without card items (readConfig/folderCards).
 *   then one row per card item —
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

/**
 * an image URL this page can show: not a broken reference, and on AEM author not an Edge
 * Delivery media URL (./media_… only exists on the published site; author serves the DAM)
 */
const usable = (src) => Boolean(src) && !src.startsWith('about:')
  && !/\/default-meta-image\.(png|jpe?g)/.test(src)
  && !(AUTHOR_ROOT && /\/media_[0-9a-f]+\./.test(src));

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
  // an image that still fails to load drops its strip rather than showing a broken icon
  img.addEventListener('error', () => pic.closest('.image')?.remove(), { once: true });
  pic.append(img);
  return pic;
}

/** page titles carry the site name ("Our milestones - Admiral"); the card heading drops it */
function withoutSiteName(title = '') {
  const site = (document.title.match(/\s[-|–]\s([^-|–]+)$/) || [])[1];
  if (!site) return title;
  return title.replace(new RegExp(`\\s[-|–]\\s${site.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
}

function indexCard(entry) {
  const pod = wrap('pod');
  if (usable(entry.image)) pod.append(wrap('image', cardPicture(entry.image)));
  pod.append(el('h3', entry.cardTitle || withoutSiteName(entry.title)));
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
    // published pages answer on their path; author pages need .html (entry.href)
    const resp = await fetch(entry.href || entry.path);
    if (!resp.ok) return out;
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const base = new URL(entry.href || entry.path, window.location.origin);
    // keep the query: author image URLs can carry rendition parameters
    const local = (src) => {
      const u = new URL(src, base);
      return u.origin === window.location.origin ? `${u.pathname}${u.search}` : u.href;
    };
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
    // published: og:image is the page's Image property (else its first image); author pages
    // fill og:image with a site default, so the first image on the page comes first there
    const firstImage = img ? local(img.getAttribute('src')) : '';
    const shareImage = usable(ogImage) ? local(ogImage) : '';
    if (!out.image) out.image = (AUTHOR_ROOT ? firstImage || shareImage : shareImage || firstImage);
  } catch {
    // page unreadable: keep what the index had
  }
  return out;
}

const byOrder = (a, b) => (Number(a.cardOrder) || 999) - (Number(b.cardOrder) || 999)
  || String(a.cardTitle || a.title).localeCompare(String(b.cardTitle || b.title));
const byLatest = (a, b) => (Number(b.lastModified) || 0) - (Number(a.lastModified) || 0);

/**
 * published site: the folder's direct child pages from the query index — or, with a category,
 * every page under the folder (any depth) whose Category property matches
 */
async function fromIndex(folder, { limit, order, category }) {
  const resp = await fetch(`${INDEX}?limit=1000`);
  if (!resp.ok) return [];
  const { data = [] } = await resp.json();
  const canonical = document.querySelector('link[rel="canonical"]');
  const here = normalise(canonical ? new URL(canonical.href).pathname : window.location.pathname);
  const prefix = folder === '/' ? '/' : `${folder}/`;
  let pages = data.filter((e) => e.path && e.path.startsWith(prefix) && e.path !== prefix
    && (category ? e.category === category : !e.path.slice(prefix.length).includes('/'))
    && normalise(e.path) !== here && !/^\/(nav|footer|fragments)(\/|$)/.test(e.path));
  // latest first can be cut before reading the pages; card order needs their properties
  if (order === 'latest') pages = pages.sort(byLatest).slice(0, limit);
  const entries = await Promise.all(pages.map(summarise));
  return order === 'latest' ? entries : entries.sort(byOrder).slice(0, limit);
}

/** author page JSON → listing entry */
function authorEntry(path, c) {
  return {
    path,
    href: `${path}.html`,
    title: c['jcr:title'] || path.split('/').pop(),
    description: c['jcr:description'],
    image: c.image,
    cardTitle: c['card-title'],
    cardSummary: c['card-summary'],
    cardLinkText: c['card-link-text'],
    cardOrder: c['card-order'],
    lastModified: Date.parse(c['cq:lastModified'] || '') / 1000 || 0,
  };
}

/**
 * Universal Editor (AEM author): the folder's child pages and their page properties — with a
 * category, every page under the folder with that Category (AEM query builder)
 */
async function fromAuthor(folder, { limit, order, category }) {
  const root = `${AUTHOR_ROOT}${folder === '/' ? '' : folder}`;
  const here = normalise(window.location.pathname);
  let pages;
  if (category) {
    const q = new URLSearchParams({
      path: root,
      type: 'cq:Page',
      property: 'jcr:content/category',
      'property.value': category,
      'p.limit': '200',
      'p.hits': 'full',
      'p.nodedepth': '1',
    });
    const resp = await fetch(`/bin/querybuilder.json?${q}`);
    if (!resp.ok) return [];
    const { hits = [] } = await resp.json();
    pages = hits.filter((h) => h['jcr:content']).map((h) => authorEntry(h['jcr:path'], h['jcr:content']));
  } else {
    const resp = await fetch(`${root}.2.json`);
    if (!resp.ok) return [];
    const json = await resp.json();
    pages = Object.entries(json)
      .filter(([, v]) => v && v['jcr:primaryType'] === 'cq:Page' && v['jcr:content'])
      .map(([name, v]) => authorEntry(`${root}/${name}`, v['jcr:content']));
  }
  pages = pages
    .filter((e) => normalise(e.path) !== here)
    .sort(order === 'latest' ? byLatest : byOrder)
    .slice(0, limit);
  // as on the published site: a page without an Image property shows its first image
  return Promise.all(pages.map(summarise));
}

/**
 * the pages of a folder as card cells (shared with cards-folder)
 * @param {string} folder site path, e.g. /about-us
 * @param {{limit?: number, order?: 'latest'|'card-order', category?: string}} options
 * @returns {Promise<Element[]>}
 */
export async function folderCards(folder, { limit = 1000, order = 'card-order', category = '' } = {}) {
  const opts = { limit, order, category };
  const entries = AUTHOR_ROOT ? await fromAuthor(folder, opts) : await fromIndex(folder, opts);
  return entries.map(indexCard);
}

export {
  folderOf, sitePath, wrap, AUTHOR_ROOT,
};

const ORDERS = ['latest', 'card-order'];
const SETTINGS = ['folder', 'count', 'category'];

/**
 * splits the block's rows into its folder settings — the leading single-cell field rows, in
 * model order: folder, count, category (set or empty) — and its card item rows (image + text
 * cells). The order is a style: class `card-order` sorts by Card order, else latest first
 * (content authored with the earlier separate Order row is still read).
 */
function readConfig(block) {
  const config = {
    folder: null,
    count: 6,
    order: block.classList.contains('card-order') ? 'card-order' : 'latest',
    category: '',
    items: [],
  };
  let field = 0;
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    const setting = row.children.length === 1 && field < SETTINGS.length && !config.items.length
      ? SETTINGS[field] : null;
    if (!setting) {
      if (!isEmptyFieldRow(row)) config.items.push(row);
      return;
    }
    if (ORDERS.includes(text.toLowerCase())) { // earlier content: an Order row after count
      config.order = text.toLowerCase();
      return;
    }
    field += 1;
    if (setting === 'folder') config.folder = folderOf(row);
    else if (setting === 'count' && /^\d+$/.test(text)) config.count = Math.max(1, Number(text));
    else if (setting === 'category') config.category = text.toLowerCase();
  });
  return config;
}

export { readConfig };

export default async function decorate(block) {
  const config = readConfig(block);
  const grid = wrap('grid');
  config.items.forEach((row) => grid.append(buildCard(row)));
  block.replaceChildren(grid);
  if (!config.folder) return;

  block.dataset.folder = config.folder;
  try {
    const cells = await folderCards(config.folder, {
      limit: config.count, order: config.order, category: config.category,
    });
    if (cells.length) grid.replaceChildren(...cells);
  } catch {
    // listing unavailable: the authored fallback cards stay
  }
}
