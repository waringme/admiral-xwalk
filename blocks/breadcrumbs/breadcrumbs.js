/**
 * breadcrumbs — Admiral breadcrumb trail (replica of www.admiral.com inner pages).
 *
 * Model rows (xwalk simple block, _breadcrumbs.json):
 *   1. text  an authored <ul>: one <li> per crumb, ancestors as links, the current page as text
 * The list is moved into the layout as authored (EW1); separators are CSS.
 */
export default function decorate(block) {
  const list = block.querySelector('ul, ol');
  const container = document.createElement('div');
  container.className = 'container';
  if (list) container.append(list);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(container);
  block.replaceChildren(nav);
}
