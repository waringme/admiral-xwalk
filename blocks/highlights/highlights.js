/**
 * highlights — Admiral benefit pods ("Why choose Admiral Travel Insurance?"): three rounded
 * pods with a heading and a line of copy (replica of www.admiral.com .pod--product.alternate).
 *
 * Model (xwalk container, _highlights.json): one row per highlight item —
 *   cell 1  image  optional icon (PPC pods show one above the heading)
 *   cell 2  text   <h3> + <p>
 * Colours: default Admiral blue · `colours` pink / yellow / orange in turn (PPC).
 * Authored nodes are moved, never rebuilt (EW1); row instrumentation moves to the pod.
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

export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'highlight';
    moveInstrumentation(row, li);
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture') || col.querySelector('img');
      const hasText = [...col.querySelectorAll('h2, h3, h4, p')]
        .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
      if (pic && !hasText) {
        const icon = document.createElement('div');
        icon.className = 'highlight-icon';
        icon.append(pic);
        li.append(icon);
      } else li.append(...col.childNodes);
    });
    list.append(li);
  });
  block.replaceChildren(list);
}
