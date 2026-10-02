import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — Admiral mega-nav (template-slotted chrome, replica of www.admiral.com).
 *
 * Authored /nav document, one section per role (in order):
 *   1. utility links  <ul>: Contact us · Help and Support · My account · Claims
 *   2. brand          one paragraph holding the logo link (linked logo image with alt text)
 *   3. main nav       <ul>: top-level <li><a>; a parent item nests a <ul> whose <li>s are
 *                     dropdown columns (optional <p><strong>subtitle</strong></p> + <ul> of links)
 *                     and one CTA panel (<p><em>title</em></p><p>text</p><p><a>link</a></p>)
 *   4. mobile extras  <ul>: appended to the mobile menu (dark, dark, rubine rows)
 *   5. quick actions  <ul>: the mobile quick-action bar, shown on the homepage only
 * Authored nodes are MOVED into the layout, never rebuilt (EW1). Generated chrome text:
 * the "Menu" toggle label and each dropdown title (repeats the parent label) — runtime UI.
 * Behaviour observed live (stardust/replica/motion/index.json): click-open dropdowns with a
 * page blackout on desktop, a toggled menu panel on mobile; static header, no scroll morph.
 */

const isDesktop = window.matchMedia('(min-width: 768px)');

const QUICK_ICONS = [
  '<svg aria-hidden="true" width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.84335 12.9809H13.9463C15.7677 12.9809 17.2437 11.5043 17.2437 9.68328V4.29763C17.2437 2.47659 15.7674 1 13.9463 1H4.05398C2.23238 1 0.756348 2.47659 0.756348 4.29763V9.68328C0.756348 11.2426 1.83938 12.5499 3.29418 12.8929L2.47977 16L7.84335 12.9809Z" stroke="#21201C" stroke-width="1.5" stroke-miterlimit="2" stroke-linejoin="round"></path></svg>',
  '<svg aria-hidden="true" width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4708 1.85898L18.0972 13.375C18.7506 14.5071 17.9335 16 16.6262 16H3.37376C2.06644 16 1.24937 14.5168 1.90303 13.3846L8.52938 1.83949C9.18304 0.707378 10.8172 0.726632 11.4708 1.85898Z" stroke="#21201C" stroke-width="1.5" stroke-miterlimit="2" stroke-linejoin="round"></path></svg>',
  '<svg aria-hidden="true" width="18" height="17" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.76207 5.23455C6.82558 7.22575 8.47213 8.8439 10.4997 8.8439C12.5897 8.8439 14.2374 7.10102 14.2374 5.11097C14.2374 3.18213 12.5262 1.43926 10.4997 1.50162C8.47213 1.50162 6.76207 3.24335 6.76207 5.23455ZM10.4997 17.5H6.12815C3.08792 17.5 3.02441 17.5 3.02441 16.1926C2.96208 15.4464 3.02441 14.7003 3.15143 13.953C3.27727 13.2693 3.53131 12.6467 3.91119 12.0877C4.41809 11.3404 5.11552 11.0921 6.12815 10.9674C7.14195 10.7803 8.28278 11.7759 8.97903 11.963C10.4362 12.336 11.7664 12.1489 13.0978 11.5275C13.3506 11.4028 14.0469 10.8426 14.9972 10.9674C15.9486 11.0921 16.5814 11.4028 17.0883 12.0877C17.5317 12.7091 17.721 13.3316 17.8492 14.0154C17.9751 14.7003 18.0386 15.3841 17.9751 16.069C17.9751 17.5 17.9751 17.5 15.0618 17.5H10.4997Z" stroke="#21201C" stroke-width="1.5"></path></svg>',
];

const UTILITY_CLASSES = ['contact', 'help-support', 'yellow mega-nav-secondary-item-account', 'claim'];
const EXTRA_CLASSES = ['mega-nav-item-black', 'mega-nav-item-black', 'mega-nav-item-red'];

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

/** the pipeline wraps a list item's link in a <p> (#98): read either shape, unwrap the <p> */
function triggerOf(li) {
  const a = li.querySelector(':scope > a, :scope > p > a');
  if (a && a.parentElement.tagName === 'P') a.parentElement.replaceWith(a);
  return a;
}

function sectionList(section) {
  return section ? section.querySelector('ul') : null;
}

function closeAll(nav, blackout) {
  nav.querySelectorAll('.mega-nav-item-open').forEach((li) => {
    li.classList.remove('mega-nav-item-open');
    li.querySelector(':scope > a').setAttribute('aria-expanded', 'false');
  });
  blackout.classList.remove('open');
}

function buildDropdown(li, label, sub) {
  const cols = [...sub.children];
  const left = el('div', 'mega-nav-dropdown-content left', el('p', 'mega-nav-dropdown-title mega-nav-show-medium', label.textContent));
  const right = el('div', 'mega-nav-dropdown-content right mega-nav-show-medium');
  cols.forEach((col) => {
    const links = col.querySelector(':scope > ul');
    if (links) {
      const column = el('div', 'mega-nav-dropdown-col');
      const subtitle = col.querySelector(':scope > p');
      if (subtitle) {
        subtitle.className = 'mega-nav-dropdown-subtitle';
        column.append(subtitle);
      } else {
        column.classList.add('mega-nav-dropdown-col-primary');
      }
      links.className = 'mega-nav-dropdown-child';
      [...links.children].forEach((item) => { item.className = 'mega-nav-item'; triggerOf(item); });
      column.append(links);
      left.append(column);
    } else {
      const cta = el('div', 'mega-nav-cta', ...col.children);
      const first = cta.querySelector('p');
      if (first) first.classList.add('mega-nav-cta-title');
      right.append(cta);
    }
  });
  const dropdown = el('div', 'mega-nav-dropdown', left);
  if (right.children.length) dropdown.append(right);
  sub.remove();
  li.append(dropdown);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  const [utility, brand, main, extras, quick] = [...fragment.querySelectorAll(':scope > .section')];

  const nav = el('div', 'mega-nav alt2');
  nav.id = 'nav';
  const blackout = el('div', 'mega-nav-blackout');

  // 1. utility bar
  const utilList = sectionList(utility);
  if (utilList) {
    [...utilList.children].forEach((li, i) => {
      li.className = `mega-nav-secondary-item mega-nav-secondary-item-${UTILITY_CLASSES[i] || 'link'}`;
      triggerOf(li);
    });
    nav.append(el('div', 'mega-nav-secondary mega-nav-show-medium', el('div', 'container', utilList)));
  }

  // 2. topbar: brand + mobile menu toggle
  const primary = el('div', 'mega-nav-primary');
  const topbar = el('div', 'mega-nav-topbar');
  const logo = brand ? brand.querySelector('a') : null;
  if (logo) {
    logo.className = 'logo';
    const logoPara = logo.closest('p');
    topbar.append(logoPara || logo);
  }
  const toggle = el('a', 'mega-nav-toggle mega-nav-hide-medium', el('span', 'menu', 'Menu'));
  toggle.href = '#';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-main');
  topbar.append(toggle);
  primary.append(topbar);

  // 5. quick actions (homepage only, mobile)
  const quickList = sectionList(quick);
  if (quickList && document.body.classList.contains('front-page')) {
    quickList.className = 'mega-nav-hero-buttons hide-tablet';
    [...quickList.children].forEach((li, i) => {
      li.className = 'mega-nav-hero-item';
      const a = triggerOf(li);
      if (!a) return;
      if (i === 2) a.classList.add('bg-yellow');
      const label = el('span', 'mega-nav-hero-label', ...a.childNodes);
      a.replaceChildren(label);
      a.insertAdjacentHTML('afterbegin', QUICK_ICONS[i] || '');
    });
    primary.append(quickList);
  }

  // 3 + 4. main nav (+ mobile-only extras)
  const mainNav = el('nav', 'mega-nav-main');
  mainNav.id = 'nav-main';
  mainNav.setAttribute('aria-label', 'Main');
  const mainList = sectionList(main);
  if (mainList) {
    mainList.className = 'mega-nav-list';
    [...mainList.children].forEach((li) => {
      li.className = 'mega-nav-item';
      const a = triggerOf(li);
      const sub = li.querySelector(':scope > ul');
      if (a && sub) {
        li.classList.add('mega-nav-item-parent');
        a.setAttribute('aria-expanded', 'false');
        a.setAttribute('role', 'button');
        buildDropdown(li, a, sub);
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const wasOpen = li.classList.contains('mega-nav-item-open');
          closeAll(nav, blackout);
          if (!wasOpen) {
            li.classList.add('mega-nav-item-open');
            a.setAttribute('aria-expanded', 'true');
            if (isDesktop.matches) blackout.classList.add('open');
          }
        });
      }
    });
    const extraList = sectionList(extras);
    if (extraList) {
      [...extraList.children].forEach((li, i) => {
        li.className = `mega-nav-item mega-nav-hide-medium ${EXTRA_CLASSES[i] || EXTRA_CLASSES[0]}`;
        triggerOf(li);
        mainList.append(li);
      });
    }
    mainNav.append(mainList);
  }
  primary.append(mainNav);
  nav.append(primary);

  toggle.addEventListener('click', (ev) => {
    ev.preventDefault();
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  blackout.addEventListener('click', () => closeAll(nav, blackout));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAll(nav, blackout);
  });
  isDesktop.addEventListener('change', () => {
    closeAll(nav, blackout);
    nav.classList.remove('is-open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // live: the blackout is the nav's sibling (z-index 30 under the nav's 31)
  block.replaceChildren(blackout, nav);
}
