/**
 * Decorates the authored quote as a semantic blockquote.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const quote = document.createElement('blockquote');
  quote.className = 'quote-test-content';
  [...cell.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((name) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
    .forEach((name) => {
      quote.setAttribute(name, cell.getAttribute(name));
      cell.removeAttribute(name);
    });
  quote.append(...cell.childNodes);
  block.replaceChildren(quote);
}
