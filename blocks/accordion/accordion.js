/**
 * accordion — Admiral FAQ pods ("Still got questions?", "What isn't covered"): white bordered
 * boxes with a +/× toggle (replica of www.admiral.com .pod--faq).
 *
 * Model (xwalk container, _accordion.json): one row per accordion-item —
 *   cell 1  summary  the question (plain text)
 *   cell 2  text     the answer (richtext)
 * Rendered as native <details>/<summary> (keyboard + screen-reader friendly, no script state).
 * Authored nodes are moved, never rebuilt (EW1); row instrumentation moves to the <details>.
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
  const items = [...block.children].map((row) => {
    const [label, body] = row.children;
    const details = document.createElement('details');
    details.className = 'accordion-item';
    moveInstrumentation(row, details);
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    if (label) {
      const inner = label.querySelector('p, h2, h3, h4');
      summary.append(...(inner || label).childNodes);
    }
    const panel = document.createElement('div');
    panel.className = 'accordion-item-body';
    if (body) panel.append(...body.childNodes);
    details.append(summary, panel);
    return details;
  });
  block.replaceChildren(...items);
}
