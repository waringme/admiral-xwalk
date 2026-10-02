/**
 * hero — Admiral "hero banner B": full-bleed photo with a navy copy panel (replica of
 * www.admiral.com). Template-slotted (stardust/eds-schema: home + about-us hero).
 *
 * Model rows (xwalk simple block, _hero.json):
 *   1. image        desktop background photo (<picture>)
 *   2. mobileImage  mobile photo shown above the copy (<picture>, optional)
 *   3. text         heading (h1 on inner pages; the homepage keeps the live h2 — R-01) +
 *                   paragraph(s) + optional CTA (<strong><a> → a.button.primary)
 * Variant class `left`: panel left-aligned, bespoke 62.5vw mobile image (homepage).
 * Authored nodes are moved into slots, never rebuilt (EW1).
 */

function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const rows = [...block.children];
  const pictures = [];
  let copyCell = null;
  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const pic = cell.querySelector('picture') || cell.querySelector('img');
    const hasText = [...cell.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
      .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
    if (pic && !hasText) pictures.push(pic);
    else if (hasText) copyCell = cell;
  });

  const [desktopPic, mobilePic] = pictures;
  const media = wrap('hero-media');
  if (desktopPic) {
    media.append(desktopPic);
    const img = desktopPic.tagName === 'IMG' ? desktopPic : desktopPic.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }
  const mobile = wrap('hero-banner-image');
  if (mobilePic) mobile.append(mobilePic);

  const copy = wrap('hero-banner-copy');
  if (copyCell) copy.append(...copyCell.children);

  block.replaceChildren(media, mobile, wrap('container-sml', wrap('hero-background', copy)));
}
