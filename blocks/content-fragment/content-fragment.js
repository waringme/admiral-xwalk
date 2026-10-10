/**
 * content-fragment — shows a shared AEM Content Fragment in this page's own layout (travel
 * landing pages: the SEO and PPC pages share the key benefits, the cover features, the cover
 * levels and What's travel insurance?; scope: stardust/travel-landing-cf-scope.md; pattern:
 * waringme/vhi-ie press-release).
 *
 * Model (xwalk block, _content-fragment.json): row 1 the fragment (picker), row 2 the picked
 * variation; Display (classes): default boxed list · `alternating` · `pods` · `pods-colours`
 * · `no-heading` · `image-right`. A Cover Levels fragment always renders as a table, a Media Text
 * fragment as the media-text panel (image beside the copy; `image-right` swaps the sides).
 * The fragment is read through the GraphQL persisted queries admiral-xwalk/feature-list-by-path,
 * admiral-xwalk/cover-levels-by-path and admiral-xwalk/media-text-by-path — same origin on AEM
 * author, else the publish tier. Rendered with the features / highlights / comparison-table /
 * callout / media-text designs (their CSS).
 * In the Universal Editor every fragment field is instrumented for in-context editing.
 * @ew-exempt all — content comes from a content fragment, not from page markup (EW5 c)
 */
import { getMetadata, loadCSS } from '../../scripts/aem.js';

// AEM publish tier serving the persisted queries (override: aem-publish-host metadata)
const DEFAULT_PUBLISH_HOST = 'https://publish-p147324-e2050468.adobeaemcloud.com';
const QUERIES = {
  'feature-list': ['admiral-xwalk/feature-list-by-path', 'featureListByPath'],
  'cover-levels': ['admiral-xwalk/cover-levels-by-path', 'coverLevelsByPath'],
  'media-text': ['admiral-xwalk/media-text-by-path', 'mediaTextByPath'],
};
// AEM answers a by-path query for another model with a partial item (shared fields such as
// title only): accept it only when the model's own fields are there
const MATCHES = {
  'feature-list': (item) => Array.isArray(item.features),
  'cover-levels': (item) => Array.isArray(item.levels),
  'media-text': (item) => Boolean(item.text || item.image),
};
const DAM_ROOT = '/content/dam';
const CACHE_WINDOW = 5 * 60 * 1000; // visitors may see a fragment up to 5 minutes old
const CROSS = /^(x|✕|×|-|–)$/i;

const isAuthor = () => window.location.hostname.endsWith('.adobeaemcloud.com');
const aemHost = () => (isAuthor() ? ''
  : (getMetadata('aem-publish-host') || DEFAULT_PUBLISH_HOST).replace(/\/$/, ''));

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.filter(Boolean).forEach((c) => node.append(c));
  return node;
}

/** row 1 the fragment (link or path), row 2 the picked variation */
function readConfig(block) {
  const [fragmentRow, variationRow] = [...block.children];
  const link = fragmentRow?.querySelector('a');
  const raw = (link ? link.getAttribute('href') : fragmentRow?.textContent)?.trim();
  let path = null;
  if (raw) {
    path = new URL(raw, window.location.origin).pathname.replace(/\.[a-z]+$/, '');
    if (!path.startsWith(DAM_ROOT)) path = null;
  }
  const variation = variationRow?.textContent.trim().toLowerCase().replace(/\s+/g, '_') || 'master';
  return { path, variation };
}

async function runQuery(type, path, variation) {
  const [query, field] = QUERIES[type];
  const host = aemHost();
  // AEM does not decode %2F in persisted query parameters: keep the slashes of the path
  const params = `;path=${encodeURI(path)};variation=${encodeURIComponent(variation)}`;
  const ts = isAuthor() ? Date.now() : Math.floor(Date.now() / CACHE_WINDOW) * CACHE_WINDOW;
  const resp = await fetch(`${host}/graphql/execute.json/${query}${params};ts=${ts}`, {
    credentials: host ? 'omit' : 'same-origin',
  });
  if (!resp.ok) throw new Error(`${resp.status} ${query}`);
  const item = (await resp.json())?.data?.[field]?.item;
  if (!item || !MATCHES[type](item)) throw new Error(`not a ${type} fragment`);
  return { type, item };
}

/** the fragment, whichever model it is (both queries race; the matching one wins) */
const fetchFragment = (path, variation) => Promise.any(
  Object.keys(QUERIES).map((type) => runQuery(type, path, variation)),
);

/** Universal Editor: a fragment (or nested fragment) as an editable resource */
function resource(node, path, label, variation = 'master') {
  if (node && isAuthor() && path) {
    node.dataset.aueResource = `urn:aemconnection:${path}/jcr:content/data/${variation}`;
    node.dataset.aueType = 'reference';
    node.dataset.aueFilter = 'cf';
    node.dataset.aueLabel = label;
  }
  return node;
}

function prop(node, name, type, label) {
  if (node && isAuthor()) {
    node.dataset.aueProp = name;
    node.dataset.aueType = type;
    node.dataset.aueLabel = label;
  }
  return node;
}

function richText(html, className) {
  if (!html || !String(html).trim()) return null;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  tpl.content.querySelectorAll('script, style, iframe').forEach((n) => n.remove());
  return el('div', className, tpl.content);
}

/** GraphQL system field `_path` of a fragment / image reference */
const pathOf = ({ _path: path } = {}) => path;

function imageUrl(ref) {
  if (!ref) return '';
  const host = aemHost();
  const { _publishUrl: publishUrl, _authorUrl: authorUrl, _path: path } = ref;
  const src = (host ? publishUrl : authorUrl) || path || '';
  return src.startsWith('/') ? `${host}${src}` : src;
}

function picture(ref, alt, name, label) {
  const src = imageUrl(ref);
  if (!src) return null;
  const img = el('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = 'lazy';
  return prop(el('picture', null, img), name, 'media', label);
}

function header(item, block) {
  if (block.classList.contains('no-heading')) return null;
  const title = item.title ? prop(el('h2', null, item.title), 'title', 'text', 'Title') : null;
  const intro = prop(richText(item.introduction?.html), 'introduction', 'richtext', 'Introduction');
  return title || intro ? el('div', 'content-fragment-header', title, intro) : null;
}

function featureList(item, block) {
  const pods = block.classList.contains('pods') || block.classList.contains('pods-colours');
  const alternating = block.classList.contains('alternating');
  const list = el('ul');
  (item.features || []).forEach((f) => {
    const li = resource(el('li', pods ? 'highlight' : 'feature'), pathOf(f), f.title || 'Feature');
    const art = alternating ? (f.illustration || f.icon) : f.icon;
    const showIcon = !block.classList.contains('pods');
    const pic = showIcon ? picture(art, f.imageAlt, alternating && f.illustration ? 'illustration' : 'icon', 'Image') : null;
    const heading = prop(el('h3', null, f.title), 'title', 'text', 'Title');
    const text = prop(richText(f.description?.html), 'description', 'richtext', 'Description');
    if (pods) {
      if (pic) li.append(el('div', 'highlight-icon', pic));
      li.append(heading);
      if (text) li.append(text);
    } else {
      if (pic) li.append(el('div', 'feature-icon', pic));
      li.append(el('div', 'feature-body', heading, text));
    }
    list.append(li);
  });
  const variant = (pods && `highlights${block.classList.contains('pods-colours') ? ' colours' : ''}`)
    || `features${alternating ? ' alternating' : ''}`;
  const footnote = prop(richText(item.footnote?.html, 'content-fragment-footnote'), 'footnote', 'richtext', 'Footnote');
  return [header(item, block), el('div', variant, list), footnote];
}

function coverLevels(item, block) {
  const note = item.goodToKnow?.html
    ? el('div', 'callout', prop(richText(item.goodToKnow.html), 'goodToKnow', 'richtext', 'Good to know'))
    : null;
  const table = el('table');
  const head = el('tr', null, el('th', null));
  ['column1', 'column2', 'column3'].forEach((c) => {
    const th = prop(el('th', null, item[c] || ''), c, 'text', c);
    th.scope = 'col';
    head.append(th);
  });
  table.append(el('thead', null, head));
  const body = el('tbody');
  (item.levels || []).forEach((level) => {
    const tr = resource(el('tr'), pathOf(level), level.benefit || 'Row');
    const th = prop(el('th', null, level.benefit || ''), 'benefit', 'text', 'Benefit');
    th.scope = 'row';
    tr.append(th);
    ['value1', 'value2', 'value3'].forEach((v) => {
      const value = (level[v] || '').trim();
      const td = prop(el('td'), v, 'text', v);
      if (CROSS.test(value) || !value) {
        const cross = el('span', 'cross');
        cross.setAttribute('aria-label', 'Not included');
        td.append(cross);
      } else td.textContent = value;
      tr.append(td);
    });
    body.append(tr);
  });
  table.append(body);
  const scroller = el('div', 'comparison-table-scroll', table);
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', item.title || 'Cover levels');
  return [header(item, block), note, el('div', 'comparison-table', scroller)];
}

function mediaText(item, block) {
  const title = block.classList.contains('no-heading') ? null
    : prop(el('h2', null, item.title), 'title', 'text', 'Title');
  const copy = el('div', 'media-text-copy', title, prop(richText(item.text?.html), 'text', 'richtext', 'Text'));
  const pic = picture(item.image, item.imageAlt, 'image', 'Image');
  const variant = `media-text${block.classList.contains('image-right') ? ' image-right' : ''}`;
  return [el('div', variant, copy, pic && el('div', 'media-text-media', pic))];
}

const RENDER = { 'feature-list': featureList, 'cover-levels': coverLevels, 'media-text': mediaText };

const STYLES = {
  'feature-list': (block) => [block.classList.contains('pods') || block.classList.contains('pods-colours')
    ? 'highlights' : 'features'],
  'cover-levels': () => ['comparison-table', 'callout'],
  'media-text': () => ['media-text'],
};

export default async function decorate(block) {
  const { path, variation } = readConfig(block);
  block.textContent = '';
  if (!path) {
    block.append(el('p', 'content-fragment-message', 'Select a content fragment.'));
    return;
  }
  try {
    const { type, item } = await fetchFragment(path, variation);
    await Promise.all(STYLES[type](block)
      .map((name) => loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`)));
    const parts = RENDER[type](item, block);
    const root = resource(el('div', `content-fragment-body ${type}`), pathOf(item) || path, `Content fragment (${variation})`, variation);
    root.append(...parts.filter(Boolean));
    block.append(root);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('content-fragment: could not load', path, e);
    const detail = isAuthor() ? ` (${e.errors ? e.errors.map((x) => x.message).join('; ') : e.message})` : '';
    block.append(el('p', 'content-fragment-message', `Could not load content fragment ${path}${detail}.`));
  }
}
