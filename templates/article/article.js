/**
 * article template — Admiral magazine article (replica of www.admiral.com/resources/travel-hub/…):
 * mint title banner, a sticky "Article contents" list beside the story, and an author bar.
 *
 * Authored content (one page, plain sections):
 *   section style `article-title`  the h1
 *   section style `article-body`   featured image + the article copy (h2 sections)
 * Page properties: Author, Author image, Published, Updated, Read time (minutes).
 * Built at runtime: the contents list (from the body's h2s) and the author bar (from the page
 * properties) — both derived, nothing authored is rebuilt (EW1).
 * @ew-exempt contents + author bar — derived from headings / page metadata (EW5 b)
 */
import { getMetadata } from '../../scripts/aem.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function shareLinks() {
  const url = encodeURIComponent(window.location.href.split('#')[0]);
  const title = encodeURIComponent(document.title);
  const share = el('div', 'article-share');
  [
    ['facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`, 'Share on Facebook'],
    ['x', `https://twitter.com/intent/tweet?url=${url}&text=${title}`, 'Share on X'],
    ['email', `mailto:?subject=${title}&body=${url}`, 'Share by email'],
  ].forEach(([name, href, label]) => {
    const a = el('a', `article-share-${name}`);
    a.href = href;
    a.setAttribute('aria-label', label);
    if (name !== 'email') {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    share.append(a);
  });
  return share;
}

function authorBar() {
  const author = getMetadata('author');
  const avatar = getMetadata('author-image');
  const published = formatDate(getMetadata('published'));
  const updated = formatDate(getMetadata('updated'));
  const minutes = getMetadata('read-time');
  if (!author && !published) return null;
  const bar = el('div', 'article-meta');
  if (avatar) {
    const img = el('img', 'article-meta-avatar');
    img.src = avatar;
    img.alt = '';
    img.loading = 'lazy';
    bar.append(img);
  }
  const who = el('div', 'article-meta-text');
  if (author) who.append(el('p', 'article-meta-author', author));
  const when = [published, updated && `Updated ${updated}`, minutes && `${minutes} minute read`]
    .filter(Boolean).join(' | ');
  if (when) who.append(el('p', 'article-meta-date', when));
  bar.append(who, shareLinks());
  return bar;
}

function contents(body) {
  const headings = [...body.querySelectorAll('h2')].filter((h) => h.textContent.trim());
  if (headings.length < 2) return null;
  const nav = el('nav', 'article-toc');
  nav.setAttribute('aria-label', 'Article contents');
  nav.append(el('h3', '', 'Article contents'));
  const list = el('ul');
  headings.forEach((h) => {
    if (!h.id) h.id = slug(h.textContent);
    const a = el('a', '', h.textContent.trim());
    a.href = `#${h.id}`;
    const li = el('li');
    li.append(a);
    list.append(li);
  });
  nav.append(list);
  return nav;
}

export default function decorate(main) {
  const body = main.querySelector('.section.article-body');
  if (!body) return;
  const story = body.querySelector('.default-content-wrapper') || body;
  const layout = el('div', 'article-layout');
  const toc = contents(story);
  const column = el('div', 'article-story');
  const bar = authorBar();
  story.before(layout);
  if (toc) layout.append(toc);
  layout.append(column);
  if (bar) column.append(bar);
  column.append(story);
}
