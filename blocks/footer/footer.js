import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — Admiral site footer (template-slotted chrome, replica of www.admiral.com).
 *
 * Authored /footer document, one section per band (in order):
 *   1. explore   <h2> + one <ul> per link column (first item = column heading, link or text)
 *   2. social    <ul> of profile links; the link text is the accessible name, painted as an icon
 *   3. legal     <ul> of legal links (first item = copyright text) + registration paragraphs
 * Authored nodes are MOVED into the layout, never rebuilt (EW1).
 */

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const SOCIAL = [['twitter', /twitter\.com|x\.com/], ['youtube', /youtube\.com/], ['facebook', /facebook\.com/]];

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;
  const [explore, social, legal] = [...fragment.querySelectorAll(':scope > .section')];
  const root = el('div', 'site-footer');

  if (explore) {
    const wrap = el('div', 'wrapper');
    const heading = explore.querySelector('h2');
    if (heading) {
      heading.classList.add('is-open');
      heading.id = 'footer-explore';
      wrap.append(heading);
    }
    const links = el('nav', 'page-links');
    links.setAttribute('aria-labelledby', 'footer-explore');
    explore.querySelectorAll('ul').forEach((ul) => links.append(el('div', 'explore-col', ul)));
    wrap.append(links);
    root.append(el('section', 'explore', wrap));
  }

  if (social) {
    const list = social.querySelector('ul');
    if (list) {
      list.className = 'social';
      list.querySelectorAll('a').forEach((a) => {
        const match = SOCIAL.find(([, re]) => re.test(a.href));
        if (match) a.classList.add(match[0]);
        a.target = '_blank';
        a.replaceChildren(el('span', 'visually-hidden', ...a.childNodes));
      });
      root.append(el('div', 'footer-icons', el('div', 'wrapper', list)));
    }
  }

  if (legal) {
    const wrap = el('div', 'wrapper');
    const list = legal.querySelector('ul');
    if (list) {
      list.className = 'links';
      wrap.append(list);
    }
    const registered = el('div', 'registered registered-address', ...legal.querySelectorAll('p'));
    wrap.append(registered);
    root.append(el('div', 'footer-links', wrap));
  }

  block.replaceChildren(root);
}
