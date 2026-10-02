/**
 * banner — Admiral award band: award artwork beside a centred heading + strapline on a
 * dark-blue ground (replica of www.admiral.com). Template-slotted (stardust/eds-schema: home).
 *
 * Model rows (xwalk simple block, _banner.json):
 *   1. image        award artwork, desktop (<picture>)
 *   2. mobileImage  award artwork, mobile (<picture>, optional)
 *   3. text         <h2> + <p> (authored Shift+Enter line breaks are kept)
 * Authored nodes are moved, never rebuilt (EW1).
 */
function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const pictures = [];
  let copyCell = null;
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const pic = cell.querySelector('picture') || cell.querySelector('img');
    const hasText = [...cell.querySelectorAll('h1, h2, h3, p')]
      .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
    if (pic && !hasText) pictures.push(pic);
    else if (hasText) copyCell = cell;
  });
  const [desktop, mobile] = pictures;
  const image = wrap('image');
  if (desktop) image.append(wrap('image-desktop', desktop));
  if (mobile) image.append(wrap('image-mobile', mobile));
  else image.classList.add('image-single');
  const text = wrap('text');
  if (copyCell) text.append(...copyCell.children);
  block.replaceChildren(wrap('container', image, text));
}
