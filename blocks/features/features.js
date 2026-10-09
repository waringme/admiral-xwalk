/**
 * features — Admiral feature list ("What does travel insurance cover?"): icon + heading + text
 * per item (replica of www.admiral.com travel-insurance landing pages).
 *
 * Model (xwalk container, _features.json): one row per feature item —
 *   cell 1  image  optional <picture> (badge icon, or a photo in the `rows` style)
 *   cell 2  text   <h3> + <p>… (a link in the heading makes the whole row a link in `rows`)
 * Styles: default boxed white cards · `alternating` icon left/right (PPC) · `rows` photo + arrow
 * (add-ons) · `ticks` tick + heading beside the text · `steps` numbered columns (making a claim).
 * Authored nodes are moved, never rebuilt (EW1); row instrumentation moves to the item.
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

export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'feature';
    moveInstrumentation(row, li);
    const icon = wrap('feature-icon');
    const body = wrap('feature-body');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture') || col.querySelector('img');
      const hasText = [...col.querySelectorAll('h2, h3, h4, p, ul')]
        .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
      if (pic && !hasText) icon.append(pic);
      else body.append(...col.childNodes);
    });
    if (icon.children.length) li.append(icon);
    li.append(body);
    // rows: the heading link stretches over the whole item (live: the add-on row is one link)
    const link = body.querySelector(':is(h2, h3, h4) a');
    if (link) li.classList.add('has-link');
    list.append(li);
  });
  block.replaceChildren(list);
}
